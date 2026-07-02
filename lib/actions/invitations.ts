"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";
import { revalidatePath } from "next/cache";
import { PLAN_LIMITS } from "@/lib/plans";
import { Plan } from "@/lib/database.types";
import { requireManager } from "@/lib/auth-helpers";
import { swapboardEmailHtml, isResendConfigured } from "@/lib/email-template";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { formatError } from "@/lib/errors";

export async function getInvitationByToken(token: string) {
  const normalizedToken = token?.trim();
  if (!normalizedToken) {
    return { success: false as const, error: "missing_token" };
  }

  const supabase = createAdminClient();
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", normalizedToken)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("getInvitationByToken error:", error);
    return { success: false as const, error: "fetch_failed" };
  }

  if (!invitation) {
    return { success: false as const, error: "invalid_or_expired" };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", invitation.organization_id)
    .single();

  return {
    success: true as const,
    invitation: { ...invitation, organization },
  };
}

export async function acceptInvitation({
  token,
  email,
  fullName,
  password,
}: {
  token: string;
  email: string;
  fullName: string;
  password: string;
}) {
  const inviteResult = await getInvitationByToken(token);
  if (!inviteResult.success) {
    return { success: false, error: "This invitation link has expired or is invalid." };
  }

  const invite = inviteResult.invitation;
  const normalizedEmail = email.trim().toLowerCase();

  if (invite.email && invite.email.toLowerCase() !== normalizedEmail) {
    return { success: false, error: "This invitation was sent to a different email address." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const supabase = createAdminClient();

  const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName.trim() },
  });

  if (signUpError) {
    return { success: false, error: formatError(signUpError.message) };
  }

  const userId = userData.user.id;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      organization_id: invite.organization_id,
      department_id: invite.department_id,
      user_role: invite.user_role,
      manager_type: invite.manager_type,
      onboarding_complete: true,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("acceptInvitation profile update error:", profileError);
    return { success: false, error: "Failed to complete onboarding. Please contact your manager." };
  }

  const { error: inviteError } = await supabase
    .from("invitations")
    .update({
      accepted_at: new Date().toISOString(),
      email: normalizedEmail,
    })
    .eq("id", invite.id);

  if (inviteError) {
    console.error("acceptInvitation invite update error:", inviteError);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("member_id")
    .eq("id", userId)
    .single();

  return {
    success: true,
    memberId: profile?.member_id ?? "",
    userRole: invite.user_role,
    email: normalizedEmail,
  };
}

async function checkInviteLimits(supabase: Awaited<ReturnType<typeof createClient>>, organizationId: string) {
  const [{ data: org }, { count: profileCount }, { count: inviteCount }] = await Promise.all([
    supabase.from("organizations").select("plan").eq("id", organizationId).single(),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).eq("is_active", true),
    supabase.from("invitations").select("*", { count: "exact", head: true }).eq("organization_id", organizationId).is("accepted_at", null),
  ]);

  const planLimit = PLAN_LIMITS[(org?.plan as Plan) ?? "trial"].maxWorkers;
  const currentTotal = (profileCount ?? 0) + (inviteCount ?? 0);

  if (currentTotal >= planLimit) {
    return { ok: false as const, error: `Limit reached: Your ${org?.plan ?? "current"} plan is limited to ${planLimit} workers. Upgrade to Grow to add more.` };
  }

  return { ok: true as const, org };
}

export async function sendInvitation(inv: {
  email: string;
  role: string;
  department_id: string;
  manager_type?: string;
  organization_id: string;
  organization_name: string;
}) {
  // Rate limit: max 20 invites per minute per org
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`invite_${inv.organization_id}_${ip}`, 20, 60000);
  if (!rl.success) {
    return { success: false, error: rl.error };
  }

  const { supabase, user, profile } = await requireManager(inv.organization_id);

  // Only admins can send invitations
  if (profile.user_role !== "org_admin") {
    return { success: false, error: "Only organization admins can send invitations." };
  }

  const limits = await checkInviteLimits(supabase, inv.organization_id);
  if (!limits.ok) return { success: false, error: limits.error };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // For managers, use the provided manager_type or default to 'general'
  // For other roles, don't set manager_type
  const managerType = inv.role === "manager" ? inv.manager_type || "general" : null;
  const deptId = inv.role === "manager" && managerType === "department" ? inv.department_id : null;

  const { data: invitation, error: dbError } = await supabase
    .from("invitations")
    .insert({
      organization_id: inv.organization_id,
      email: inv.email.trim().toLowerCase(),
      user_role: inv.role,
      department_id: deptId,
      manager_type: managerType,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (dbError) return { success: false, error: formatError(dbError.message) };

  if (!isResendConfigured() || !resend) {
    await supabase.from("invitations").delete().eq("id", invitation.id);
    return { success: false, error: "Email service is not configured. Invitation was not created." };
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invitation.token}`;

  try {
    await resend.emails.send({
      from: "SwapBoard <no-reply@swapboard.ca>",
      to: inv.email,
      subject: `Join ${inv.organization_name} on SwapBoard`,
      html: swapboardEmailHtml({
        title: `Join ${inv.organization_name} on SwapBoard`,
        body: `You've been invited to join <strong>${inv.organization_name}</strong> on SwapBoard as a <strong>${inv.role}</strong>.`,
        buttonText: "Accept Invitation",
        buttonUrl: inviteLink,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
    await supabase.from("invitations").delete().eq("id", invitation.id);
    return { success: false, error: "Failed to send invitation email. Please try again." };
  }

  revalidatePath("/team");
  revalidatePath("/settings");

  return { success: true, invitation };
}

export async function createManualInvitation(inv: {
  role: string;
  department_id: string;
  manager_type?: string;
  organization_id: string;
}) {
  // Rate limit: max 10 link generations per minute per org
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`invite_link_${inv.organization_id}_${ip}`, 10, 60000);
  if (!rl.success) {
    return { success: false, error: rl.error };
  }

  const { supabase, user, profile } = await requireManager(inv.organization_id);

  // Only admins can create invitation links
  if (profile.user_role !== "org_admin") {
    return { success: false, error: "Only organization admins can create invitation links." };
  }

  const limits = await checkInviteLimits(supabase, inv.organization_id);
  if (!limits.ok) return { success: false, error: limits.error };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // For managers, use the provided manager_type or default to 'general'
  const managerType = inv.role === "manager" ? inv.manager_type || "general" : null;
  const deptId = inv.role === "manager" && managerType === "department" ? inv.department_id : null;

  const { data: invitation, error: dbError } = await supabase
    .from("invitations")
    .insert({
      organization_id: inv.organization_id,
      email: null,
      user_role: inv.role,
      department_id: deptId,
      manager_type: managerType,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (dbError) return { success: false, error: formatError(dbError.message) };

  revalidatePath("/team");
  revalidatePath("/settings");

  return { success: true, invitation };
}

export async function deleteInvitation(id: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized: Please log in again." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id, user_role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.user_role !== "org_admin") {
    return { success: false, error: "Only organization admins can revoke invitations" };
  }

  const { error: deleteError } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("organization_id", profile.organization_id);

  if (deleteError) {
    return { success: false, error: formatError(deleteError.message) };
  }

  revalidatePath("/team");
  revalidatePath("/settings");

  return { success: true };
}
