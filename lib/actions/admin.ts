"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlatformAdmin } from "@/lib/admin-config";
import { PLAN_LIMITS } from "@/lib/plans";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
