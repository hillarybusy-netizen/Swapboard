"use server";

import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { revalidatePath } from "next/cache";
import { PLAN_LIMITS } from "@/lib/plans";
import { Plan } from "@/lib/database.types";

export async function sendInvitation(inv: {
  email: string;
  role: string;
  department_id: string;
  organization_id: string;
  organization_name: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error in sendInvitation:", authError);
    return { success: false, error: "Unauthorized" };
  }

  // Check plan limits
  const [{ data: org }, { count: profileCount }, { count: inviteCount }] = await Promise.all([
    supabase.from("organizations").select("plan").eq("id", inv.organization_id).single(),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("organization_id", inv.organization_id).eq("is_active", true),
    supabase.from("invitations").select("*", { count: "exact", head: true }).eq("organization_id", inv.organization_id).is("accepted_at", null)
  ]);

  const planLimit = PLAN_LIMITS[(org as any)?.plan as Plan]?.maxWorkers ?? 50;
  const currentTotal = (profileCount ?? 0) + (inviteCount ?? 0);

  if (currentTotal >= planLimit) {
    return { success: false, error: `Limit reached: Your ${org?.plan ?? 'current'} plan is limited to ${planLimit} workers. Upgrade to Grow to add more.` };
  }

  // Create invitation in database with 7-day expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invitation, error: dbError } = await supabase
    .from("invitations")
    .insert({
      organization_id: inv.organization_id,
      email: inv.email.trim().toLowerCase(),
      user_role: inv.role,
      department_id: inv.department_id || null,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (dbError) return { success: false, error: dbError.message };

  // Send email via Resend
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invitation.token}`;

  try {
    if (resend && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_123")) {
      await resend.emails.send({
        from: 'SwapBoard <no-reply@swapboard.ca>',
        to: inv.email,
        subject: `Join ${inv.organization_name} on SwapBoard`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: white; border-radius: 20px;">
            <h1 style="color: #FFD700; margin-bottom: 20px;">SwapBoard</h1>
            <p style="font-size: 16px; line-height: 1.5; color: rgba(255,255,255,0.7);">
              You've been invited to join <strong>${inv.organization_name}</strong> on SwapBoard as a <strong>${inv.role}</strong>.
            </p>
            <div style="margin-top: 30px; margin-bottom: 30px;">
              <a href="${inviteLink}" style="background-color: #FFD700; color: #050505; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="font-size: 12px; color: rgba(255,255,255,0.3);">
              If the button above doesn't work, copy and paste this link into your browser:<br/>
              <a href="${inviteLink}" style="color: #FFD700;">${inviteLink}</a>
            </p>
          </div>
        `,
      });
    } else {
      console.warn("RESEND_API_KEY not configured correctly. Email not sent.");
    }
  } catch (emailError) {
    console.error("Failed to send email:", emailError);
    // We don't throw here because the DB record was created successfully
  }

  revalidatePath("/team");
  revalidatePath("/settings");
  
  return { success: true, invitation };
}

export async function createManualInvitation(inv: {
  role: string;
  department_id: string;
  organization_id: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error in createManualInvitation:", authError);
    return { success: false, error: "Unauthorized" };
  }

  // Check plan limits
  const [{ data: org }, { count: profileCount }, { count: inviteCount }] = await Promise.all([
    supabase.from("organizations").select("plan").eq("id", inv.organization_id).single(),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("organization_id", inv.organization_id).eq("is_active", true),
    supabase.from("invitations").select("*", { count: "exact", head: true }).eq("organization_id", inv.organization_id).is("accepted_at", null)
  ]);

  const planLimit = PLAN_LIMITS[(org as any)?.plan as Plan]?.maxWorkers ?? 50;
  const currentTotal = (profileCount ?? 0) + (inviteCount ?? 0);

  if (currentTotal >= planLimit) {
    return { success: false, error: `Limit reached: Your ${org?.plan ?? 'current'} plan is limited to ${planLimit} workers. Upgrade to Grow to add more.` };
  }

  // Create invitation in database with 7-day expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invitation, error: dbError } = await supabase
    .from("invitations")
    .insert({
      organization_id: inv.organization_id,
      email: null, // Generic link
      user_role: inv.role,
      department_id: inv.department_id || null,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (dbError) return { success: false, error: dbError.message };

  revalidatePath("/team");
  revalidatePath("/settings");
  
  return { success: true, invitation };
}

export async function deleteInvitation(id: string) {
  const supabase = await createClient();
  
  // Use getSession as a backup check for the user ID if getUser fails with a weird cookie issue
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error in deleteInvitation:", authError);
    return { success: false, error: "Unauthorized: Please log in again." };
  }

  // Get user's org to ensure they only delete their own org's invites
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id, user_role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || (profile.user_role !== 'manager' && profile.user_role !== 'admin')) {
    console.error("Profile check error in deleteInvitation:", profileError);
    return { success: false, error: "Only managers can revoke invitations" };
  }

  const { error: deleteError } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("organization_id", profile.organization_id);

  if (deleteError) {
    console.error("Delete invitation error:", deleteError);
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/team");
  revalidatePath("/settings");
  
  return { success: true };
}
