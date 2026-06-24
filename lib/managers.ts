import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/database.types";

/**
 * Check if a manager can access a specific department
 * - General Managers can access all departments
 * - Department Managers can only access their assigned department
 */
export function canManagerAccessDepartment(
  profile: Profile,
  departmentId?: string | null
): boolean {
  if (profile.user_role !== "manager") {
    return false;
  }

  if (profile.manager_type === "general") {
    return true;
  }

  if (profile.manager_type === "department") {
    return profile.department_id === departmentId;
  }

  return false;
}

/**
 * Get managers visible to a user based on their department
 * - Returns all General Managers
 * - Returns Department Managers only if they match the user's department
 */
export async function getVisibleManagers(
  orgId: string,
  userDepartmentId?: string | null
): Promise<Profile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_role", "manager")
    .eq("is_active", true)
    .order("full_name");

  // If user is in a department, filter for General Managers + Department Managers of their dept
  if (userDepartmentId) {
    query = query.or(
      `manager_type.eq.general,and(manager_type.eq.department,department_id.eq.${userDepartmentId})`
    );
  } else {
    // If user has no department, only show General Managers
    query = query.eq("manager_type", "general");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching visible managers:", error);
    return [];
  }

  return (data || []) as Profile[];
}

/**
 * Check if a manager is accessible to a user
 * - General Managers are always accessible
 * - Department Managers are only accessible if user is in their department
 */
export async function isManagerAccessible(
  managerId: string,
  userDepartmentId?: string | null
): Promise<boolean> {
  const supabase = await createClient();

  const { data: manager, error } = await supabase
    .from("profiles")
    .select("manager_type, department_id")
    .eq("id", managerId)
    .single();

  if (error || !manager) {
    return false;
  }

  if (manager.manager_type === "general") {
    return true;
  }

  // Department Manager: only accessible if user is in same department
  return manager.department_id === userDepartmentId;
}

/**
 * Get all managers for an organization (admin view)
 */
export async function getAllManagers(orgId: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_role", "manager")
    .eq("is_active", true)
    .order("full_name");

  if (error) {
    console.error("Error fetching all managers:", error);
    return [];
  }

  return (data || []) as Profile[];
}

/**
 * Get managers for a specific department
 */
export async function getManagersByDepartment(
  orgId: string,
  departmentId: string
): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_role", "manager")
    .eq("is_active", true)
    .or(`manager_type.eq.general,and(manager_type.eq.department,department_id.eq.${departmentId})`)
    .order("full_name");

  if (error) {
    console.error("Error fetching managers by department:", error);
    return [];
  }

  return (data || []) as Profile[];
}

/**
 * Get general managers for an organization
 */
export async function getGeneralManagers(orgId: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_role", "manager")
    .eq("manager_type", "general")
    .eq("is_active", true)
    .order("full_name");

  if (error) {
    console.error("Error fetching general managers:", error);
    return [];
  }

  return (data || []) as Profile[];
}

/**
 * Get department managers for an organization
 */
export async function getDepartmentManagers(orgId: string): Promise<Profile[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_role", "manager")
    .eq("manager_type", "department")
    .eq("is_active", true)
    .order("full_name");

  if (error) {
    console.error("Error fetching department managers:", error);
    return [];
  }

  return (data || []) as Profile[];
}
