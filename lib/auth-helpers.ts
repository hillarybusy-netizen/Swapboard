import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { supabase, user, profile: profile as any };
}

export async function requireManager(orgId?: string) {
  const { supabase, user, profile } = await requireUser();

  if (!profile) throw new Error("Unauthorized");
  if (profile.user_role !== "manager" && profile.user_role !== "org_admin") {
    throw new Error("Only managers can perform this action");
  }
  if (orgId && profile.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }
  return { supabase, user, profile };
}

export async function requireOrgAdmin(orgId?: string) {
  const { supabase, user, profile } = await requireUser();

  if (!profile) throw new Error("Unauthorized");
  if (profile.user_role !== "org_admin") {
    throw new Error("Only organization admins can perform this action");
  }
  if (orgId && profile.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }
  return { supabase, user, profile };
}

export async function requireSuperAdmin() {
  const { supabase, user, profile } = await requireUser();

  if (!profile) throw new Error("Unauthorized");
  if (profile.user_role !== "super_admin") {
    throw new Error("Only super admins can perform this action");
  }
  return { supabase, user, profile };
}

// Legacy alias for backward compatibility
export const requireAdmin = requireOrgAdmin;
