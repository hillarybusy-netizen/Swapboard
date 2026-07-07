"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { registerUser, signInUser } from "@/lib/actions/auth";

interface PendingDepartment {
  name: string;
  color: string;
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

    // Roles removed
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

async function rollbackRegistration(userId: string, orgId?: string) {
  const admin = createAdminClient();
  try {
    if (orgId) {
      await admin.from("organizations").delete().eq("id", orgId);
    }
    await admin.auth.admin.deleteUser(userId);
  } catch (err) {
    console.error("[rollbackRegistration] cleanup failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────
// registerAndSetupWorkspace
// Used for the anonymous onboarding path — registers the user,
// signs them in server-side, then provisions the whole workspace.
// Rolls back the auth user (and any partial org) on setup failure.
// ─────────────────────────────────────────────────────────────
export async function registerAndSetupWorkspace({
  fullName,
  email,
  password,
  orgName,
  industry,
  departments,
  honeypot,
}: {
  fullName: string;
  email: string;
  password: string;
  orgName: string;
  industry: string;
  departments: PendingDepartment[];
  honeypot?: string;
}): Promise<{ success: boolean; error?: string; orgId?: string; departmentMap?: Record<string, string> }> {
  if (!fullName.trim()) return { success: false, error: "Full name is required." };

  const registerResult = await registerUser({ email, password, fullName, honeypot });
  if (!registerResult.success) return { success: false, error: registerResult.error };

  // Honeypot triggered — silently succeed without provisioning
  if (registerResult.userId === "bot-trap") return { success: true };

  const userId = registerResult.userId!;

  // Brief wait for the profile trigger to complete
  await new Promise((resolve) => setTimeout(resolve, 300));

  const normalizedEmail = email.trim().toLowerCase();
  const signInResult = await signInUser({ email: normalizedEmail, password, honeypot });
  if (!signInResult.success) {
    await rollbackRegistration(userId);
    return { success: false, error: "Account created but sign-in failed. Please log in manually." };
  }

  let orgId: string | undefined;
  try {
    const { orgId: createdOrgId, departmentMap } = await setupWorkspace(userId, orgName, industry, departments);
    orgId = createdOrgId;

    const admin = createAdminClient();
    await admin.from("profiles").update({ onboarding_complete: true }).eq("id", userId);

    return { success: true, orgId, departmentMap };
  } catch (err: unknown) {
    await rollbackRegistration(userId, orgId);
    const message = err instanceof Error ? err.message : "Workspace setup failed.";
    return { success: false, error: message };
  }
}
