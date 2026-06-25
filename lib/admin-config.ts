import { createClient } from "@/lib/supabase/server";

export function getPlatformAdminEmails(): string[] {
  const fromEnv = process.env.PLATFORM_ADMIN_EMAILS;
  if (fromEnv) {
    return fromEnv.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return ["admin@swapboard.app", "brendan@swapboard.app"];
}

export async function isPlatformAdmin(email: string | undefined) {
  if (!email) return false;

  const normalized = email.toLowerCase();
  // 1) Check env var overrides
  if (getPlatformAdminEmails().includes(normalized)) return true;

  // 2) Fallback to database check (profiles.user_role === 'admin')
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("user_role")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      console.error("isPlatformAdmin supabase error:", error.message || error);
      return false;
    }

    return data?.user_role === "admin";
  } catch (err) {
    console.error("isPlatformAdmin error:", err);
    return false;
  }
}
