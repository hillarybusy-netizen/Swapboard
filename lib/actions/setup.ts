"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { DepartmentTemplate } from "@/lib/industry-templates";

export async function setupWorkspace(
  userId: string,
  orgName: string,
  industry: string,
  departments: DepartmentTemplate[]
) {
  const supabase = createAdminClient();

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  // 1. Create Organization
  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .insert({
      name: orgName,
      industry: industry,
      plan: "trial",
      trial_started_at: new Date().toISOString(),
      trial_ends_at: trialEnd.toISOString(),
    })
    .select()
    .single();

  if (orgErr) throw new Error("Failed to create organization: " + orgErr.message);

  // 2. Create Departments & Roles
  for (let i = 0; i < departments.length; i++) {
    const dept = departments[i];
    if (!dept.name.trim()) continue;

    const { data: dbDept, error: deptErr } = await supabase
      .from("departments")
      .insert({
        organization_id: org.id,
        name: dept.name,
        color: dept.color,
        requires_certification: dept.requiresCertification ?? false,
        sort_order: i,
      })
      .select()
      .single();

    if (deptErr) throw new Error("Failed to create department: " + deptErr.message);

    if (dept.roles.length > 0) {
      const { error: rolesErr } = await supabase.from("roles").insert(
        dept.roles.map((r) => ({
          organization_id: org.id,
          department_id: dbDept.id,
          name: r.name,
          min_hours_notice: r.minHoursNotice,
        }))
      );
      if (rolesErr) throw new Error("Failed to create roles: " + rolesErr.message);
    }
  }

  // 3. Update Profile
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      organization_id: org.id,
      user_role: "admin",
      onboarding_complete: false,
    })
    .eq("id", userId);

  if (profileErr) throw new Error("Failed to update profile: " + profileErr.message);

  return { success: true };
}
