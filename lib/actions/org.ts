"use server";

import { requireOrgAdmin } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function updateOrganizationName(orgId: string, name: string) {
  const { supabase } = await requireOrgAdmin(orgId);
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Organization name is required");

  const { error } = await supabase
    .from("organizations")
    .update({ name: trimmed })
    .eq("id", orgId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}

export async function updateOrganizationLogo(orgId: string, logoUrl: string) {
  const { supabase } = await requireOrgAdmin(orgId);

  const { data: org, error: fetchError } = await supabase
    .from("organizations")
    .select("settings")
    .eq("id", orgId)
    .single();

  if (fetchError || !org) throw new Error("Organization not found");

  const currentSettings = (org.settings as Record<string, unknown>) || {};
  const { error } = await supabase
    .from("organizations")
    .update({ settings: { ...currentSettings, logo_url: logoUrl } })
    .eq("id", orgId);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
  return { success: true };
}
