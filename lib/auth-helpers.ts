import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function requireManager(orgId?: string) {
  const { supabase, user } = await requireUser();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id, user_role")
    .eq("id", user.id)
    .single();

  if (error || !profile) throw new Error("Unauthorized");
  if (profile.user_role !== "manager" && profile.user_role !== "admin") {
    throw new Error("Only managers can perform this action");
  }
  if (orgId && profile.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }
  return { supabase, user, profile };
}
