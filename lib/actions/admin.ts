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
  if (!user || !(await isPlatformAdmin(user.email))) {
    redirect("/dashboard");
  }
  return { user };
}

export async function getAdminStats() {
  await ensureAdmin();
  const admin = createAdminClient();

  const { count: orgCount } = await admin
    .from("organizations")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: plansData } = await admin.from("organizations").select("plan");

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
    planCounts,
    estimatedMRR,
  };
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
        .eq("initiator_id", user.id);

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

export async function impersonateUser(userId: string) {
  // Placeholder: implementing secure impersonation requires creating a temporary session token
  // with the Supabase service role key and setting cookies. This is left as a TODO.
  throw new Error("Impersonation not implemented. Requires server session creation with SUPABASE_SERVICE_ROLE_KEY.");
}
