"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/admin-config";
import { PLAN_LIMITS } from "@/lib/plans";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isPlatformAdmin(user.email, user.id))) {
    redirect("/login");
  }
  return { user };
}

export async function getAdminStats() {
  await ensureAdmin();
  const admin = createAdminClient();

  const [
    { count: orgCount },
    { count: userCount },
    { count: activeUserCount },
    { count: shiftsCount },
    { count: swapsCount },
    { count: approvedSwapsCount },
    { data: plansData },
    { data: recentSwapsData },
    { data: recentAuditData },
  ] = await Promise.all([
    admin.from("organizations").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    admin.from("shifts").select("*", { count: "exact", head: true }),
    admin.from("swap_requests").select("*", { count: "exact", head: true }),
    admin.from("swap_requests").select("*", { count: "exact", head: true }).eq("status", "manager_approved"),
    admin.from("organizations").select("plan"),
    admin
      .from("swap_requests")
      .select(`
        id,
        status,
        created_at,
        reason,
        organization:organizations(name),
        requester:profiles!requester_id(full_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(6),
    admin
      .from("audit_logs")
      .select(`
        id,
        entity_type,
        action,
        metadata,
        created_at,
        organization:organizations(name),
        actor:profiles!actor_id(full_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const planCounts = (plansData ?? []).reduce((acc: Record<string, number>, org: { plan: string }) => {
    acc[org.plan] = (acc[org.plan] || 0) + 1;
    return acc;
  }, {});

  const estimatedMRR = (plansData ?? []).reduce((total: number, org: { plan: string }) => {
    return total + (PLAN_LIMITS[org.plan as keyof typeof PLAN_LIMITS]?.price || 0);
  }, 0);

  return {
    orgCount: orgCount || 0,
    userCount: userCount || 0,
    activeUserCount: activeUserCount || 0,
    shiftsCount: shiftsCount || 0,
    swapsCount: swapsCount || 0,
    approvedSwapsCount: approvedSwapsCount || 0,
    planCounts,
    estimatedMRR,
    recentSwaps: recentSwapsData || [],
    recentAudit: recentAuditData || [],
  };
}

export async function getPlatformAuditLogs(limit = 100) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("audit_logs")
    .select(`
      id,
      entity_type,
      entity_id,
      action,
      metadata,
      created_at,
      organization:organizations(id, name),
      actor:profiles!actor_id(id, full_name, email, user_role)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching platform audit logs:", error);
    return [];
  }
  return data || [];
}

export async function getOrganizations() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getAllUsers() {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("*, organization:organizations(name)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getDetailedUsers() {
  await ensureAdmin();
  const admin = createAdminClient();
  
  const { data: usersData } = await admin
    .from("profiles")
    .select("*, organization:organizations(name, plan)")
    .order("created_at", { ascending: false });

  if (!usersData) return [];

  const users = await Promise.all(
    usersData.map(async (user: any) => {
      const { count } = await admin
        .from("swap_requests")
        .select("*", { count: "exact", head: true })
        .eq("requester_id", user.id);

      return {
        ...user,
        swapCount: count || 0,
      };
    })
  );

  return users;
}

export async function deactivateUser(userId: string, isActive: boolean) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");
}

export async function assignUserRole(userId: string, role: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ user_role: role })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");
}

export async function createApiKey(userId: string) {
  // Creates a one-time API key delivered to the admin and stores a hash in audit_logs
  const { user } = await ensureAdmin();
  const admin = createAdminClient();

  // fetch target user's org for audit record
  const { data: target } = await admin.from("profiles").select("organization_id").eq("id", userId).single();
  const orgId = (target as any)?.organization_id || null;

  const rawKey = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const { error } = await admin.from("audit_logs").insert({
    organization_id: orgId,
    entity_type: "api_key",
    entity_id: userId,
    action: "create",
    actor_id: user.id,
    metadata: { key_hash: hash },
  });

  if (error) throw error;
  // Return the raw key once — admin must copy it now
  return rawKey;
}

export async function updateOrganizationPlan(orgId: string, plan: string) {
  const { user } = await ensureAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("organizations")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", orgId);

  if (error) throw error;

  await admin.from("audit_logs").insert({
    organization_id: orgId,
    entity_type: "organization",
    entity_id: orgId,
    action: `plan_changed_to_${plan}`,
    actor_id: user.id,
    metadata: { new_plan: plan },
  });

  revalidatePath("/super-admin/organizations");
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/audit-logs");
}

export async function extendOrganizationTrial(orgId: string, days: number) {
  const { user } = await ensureAdmin();
  const admin = createAdminClient();

  const { data: org } = await admin
    .from("organizations")
    .select("trial_ends_at")
    .eq("id", orgId)
    .single();

  const currentEnd = org?.trial_ends_at ? new Date(org.trial_ends_at) : new Date();
  const baseTime = currentEnd.getTime() > Date.now() ? currentEnd.getTime() : Date.now();
  const newEnd = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await admin
    .from("organizations")
    .update({
      plan: "trial",
      trial_ends_at: newEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orgId);

  if (error) throw error;

  await admin.from("audit_logs").insert({
    organization_id: orgId,
    entity_type: "organization",
    entity_id: orgId,
    action: "trial_extended",
    actor_id: user.id,
    metadata: { extended_days: days, new_trial_end: newEnd },
  });

  revalidatePath("/super-admin/organizations");
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/audit-logs");
}

export async function superAdminDeleteOrganization(orgId: string) {
  await ensureAdmin();
  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .eq("organization_id", orgId);

  if (profiles && profiles.length > 0) {
    await Promise.allSettled(
      profiles.map((p) => admin.auth.admin.deleteUser(p.id))
    );
  }

  const { error } = await admin.from("organizations").delete().eq("id", orgId);
  if (error) throw error;

  revalidatePath("/super-admin/organizations");
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/users");
  revalidatePath("/super-admin/audit-logs");
}

export async function superAdminDeleteUser(userId: string) {
  const { user } = await ensureAdmin();
  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("organization_id, email")
    .eq("id", userId)
    .maybeSingle();

  const orgId = target?.organization_id;

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    await admin.from("profiles").delete().eq("id", userId);
  }

  if (orgId) {
    await admin.from("audit_logs").insert({
      organization_id: orgId,
      entity_type: "user",
      entity_id: userId,
      action: "user_deleted",
      actor_id: user.id,
      metadata: { deleted_email: target?.email },
    });
  }

  revalidatePath("/super-admin/users");
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/super-admin/audit-logs");
}

export async function superAdminResetPassword(email: string) {
  const { user } = await ensureAdmin();
  const admin = createAdminClient();

  // Generate a password reset link via admin API
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error) throw error;

  // Also audit log it
  const { data: target } = await admin
    .from("profiles")
    .select("id, organization_id")
    .eq("email", email)
    .maybeSingle();

  if (target) {
    await admin.from("audit_logs").insert({
      organization_id: target.organization_id,
      entity_type: "user",
      entity_id: target.id,
      action: "password_reset_sent",
      actor_id: user.id,
      metadata: { target_email: email },
    });
  }

  revalidatePath("/super-admin/users");
  revalidatePath("/super-admin/audit-logs");

  return { success: true, email };
}

export async function superAdminUpdateUserRole(userId: string, role: string) {
  const { user } = await ensureAdmin();
  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("organization_id, email, user_role")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await admin
    .from("profiles")
    .update({ user_role: role })
    .eq("id", userId);

  if (error) throw error;

  if (target?.organization_id) {
    await admin.from("audit_logs").insert({
      organization_id: target.organization_id,
      entity_type: "user",
      entity_id: userId,
      action: "role_changed",
      actor_id: user.id,
      metadata: {
        target_email: target.email,
        old_role: target.user_role,
        new_role: role,
      },
    });
  }

  revalidatePath("/super-admin/users");
  revalidatePath("/super-admin/audit-logs");
  revalidatePath("/admin/users");
}

export async function impersonateUser(userId: string) {
  throw new Error("Impersonation not implemented. Requires server session creation with SUPABASE_SERVICE_ROLE_KEY.");
}
