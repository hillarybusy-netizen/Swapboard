import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/admin-config";

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
  if (profile.user_role !== "manager" && profile.user_role !== "admin") {
    throw new Error("Only managers can perform this action");
  }
  if (orgId && profile.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }
  return { supabase, user, profile };
}

export async function requireAdmin(orgId?: string) {
  const { supabase, user, profile } = await requireUser();

  if (!profile) throw new Error("Unauthorized");
  // Allow platform admins (from env) as well as org admins
  if (profile.user_role !== "admin" && !(await isPlatformAdmin(user.email))) {
    throw new Error("Only admins can perform this action");
  }
  if (orgId && profile.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }
  return { supabase, user, profile };
}
