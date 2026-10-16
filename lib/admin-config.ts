import { createAdminClient } from "@/lib/supabase/admin";

export function getPlatformAdminEmails(): string[] {
  const fromEnv = process.env.PLATFORM_ADMIN_EMAILS;
  if (fromEnv) {
    return fromEnv.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

export async function isSuperAdmin(email: string | undefined | null, userId?: string | null) {
  if (!email && !userId) return false;

  const normalized = email ? email.trim().toLowerCase() : "";
  // 1) Check env var overrides
  if (normalized && getPlatformAdminEmails().includes(normalized)) return true;

  // 2) Check database for super_admin role using admin client (bypasses RLS)
  try {
    const admin = createAdminClient();
    if (userId) {
      const { data, error } = await admin
        .from("profiles")
        .select("user_role")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data?.user_role === "super_admin") {
        return true;
      }
    }

    if (normalized) {
      const { data, error } = await admin
        .from("profiles")
        .select("user_role")
        .ilike("email", normalized)
        .maybeSingle();

      if (!error && data?.user_role === "super_admin") {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error("isSuperAdmin error:", err);
    return false;
  }
}

// Alias for backward compatibility
export const isPlatformAdmin = isSuperAdmin;

