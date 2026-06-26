"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface PendingDepartment {
  name: string;
  color: string;
  roles: { name: string; minHoursNotice: number }[];
  requiresCertification?: boolean;
}

export async function setupWorkspace(
  userId: string,
  orgName: string,
  industry: string,
  departments: PendingDepartment[]
): Promise<{ orgId: string; departmentMap: Record<string, string> }> {
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

  // 2. Initialize departmentMap and create General Department (always available for unassigned shifts)
  const departmentMap: Record<string, string> = {};

  const { data: generalDept, error: generalDeptErr } = await supabase
    .from("departments")
    .insert({
      organization_id: org.id,
      name: "General",
      color: "#6b7280",
      requires_certification: false,
      sort_order: 0,
    })
    .select()
    .single();

  if (generalDeptErr) throw new Error("Failed to create General department: " + generalDeptErr.message);

  departmentMap["General"] = generalDept.id;

  // 3. Create Industry-Specific Departments & Roles — build a name→id map for invite resolution
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
        sort_order: i + 1,
      })
      .select()
      .single();

    if (deptErr) throw new Error("Failed to create department: " + deptErr.message);

    // Map department name → real DB id
    departmentMap[dept.name] = dbDept.id;

    if (dept.roles && dept.roles.length > 0) {
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

  // 4. Update Profile
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      organization_id: org.id,
      user_role: "org_admin",
      onboarding_complete: false,
    })
    .eq("id", userId);

  if (profileErr) throw new Error("Failed to update profile: " + profileErr.message);

  return { orgId: org.id, departmentMap };
}
