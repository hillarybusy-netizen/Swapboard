import { cache } from "react";
import { createClient } from "./server";
import type { Profile, Organization } from "@/lib/database.types";

export type CachedSession = {
  user: any;
  profile: (Profile & { organization: Organization | null }) | null;
};

export const getCachedSession = cache(async (): Promise<CachedSession> => {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single();

  return { user, profile: profile as any };
});
