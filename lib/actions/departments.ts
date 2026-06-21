"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireManager } from "@/lib/auth-helpers";
import { checkPlanLimit } from "@/lib/plans";
import { revalidatePath } from "next/cache";

export async function addDepartment(orgId: string, name: string, sortOrder: number) {
  const { supabase, user, profile } = await requireManager(orgId);

  // Only admins can create departments
  if (profile.user_role !== "admin") {
    throw new Error("Only organization admins can create departments.");
  }

  // Check the plan limit on the server side
  const [{ data: org }, { count: deptCount }] = await Promise.all([
    supabase.from("organizations").select("plan").eq("id", orgId).single(),
    supabase.from("departments").select("*", { count: "exact", head: true }).eq("organization_id", orgId)
  ]);

  const maxDepts = checkPlanLimit(org?.plan || "trial", "maxDepartments");

  if ((deptCount ?? 0) >= maxDepts) {
    return { 
      success: false, 
      error: `Limit reached: Your current plan is limited to ${maxDepts} departments. Please upgrade to add more.` 
    };
  }

  // Insert securely
  const { error } = await supabase
    .from("departments")
    .insert({
      organization_id: orgId,
      name: name.trim(),
      color: "#6366f1", // Default color
      sort_order: sortOrder
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}
