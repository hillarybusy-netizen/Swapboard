"use server";

import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/admin-config";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await isPlatformAdmin(user.email))) {
    redirect("/dashboard");
  }
  return { supabase, user };
}

export async function getAdminStats() {
  const { supabase } = await ensureAdmin();

  const { count: orgCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { data: plansData } = await supabase
    .from("organizations")
    .select("plan");

  const planCounts = (plansData ?? []).reduce((acc: any, org: any) => {
    acc[org.plan] = (acc[org.plan] || 0) + 1;
    return acc;
  }, {});

  // Revenue estimation
  const prices: any = {
    starter: 49,
    pro: 199,
    enterprise: 999,
    trial: 0
  };

  const estimatedMRR = (plansData ?? []).reduce((total: number, org: any) => {
    return total + (prices[org.plan] || 0);
  }, 0);

  return {
    orgCount: orgCount || 0,
    userCount: userCount || 0,
    planCounts,
    estimatedMRR
  };
}

export async function getOrganizations() {
  const { supabase } = await ensureAdmin();
  const { data } = await supabase
    .from("organizations")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getAllUsers() {
  const { supabase } = await ensureAdmin();
  const { data } = await supabase
    .from("profiles")
    .select("*, organization:organizations(name)")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function deactivateUser(userId: string, isActive: boolean) {
  const { supabase } = await ensureAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/users");
}
