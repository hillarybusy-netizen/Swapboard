"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const full_name = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const personal_email = formData.get("personal_email") as string;
  const emergency_contact_name = formData.get(
    "emergency_contact_name"
  ) as string;
  const emergency_contact_phone = formData.get(
    "emergency_contact_phone"
  ) as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: full_name || null,
      phone: phone || null,
      personal_email: personal_email || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/my-profile");
  revalidatePath("/home");
  revalidatePath("/settings");
  revalidatePath("/admin/settings");

  return { success: true };
}

export async function updateNotificationPreferences(prefs: {
  in_app: boolean;
  email_immediate: boolean;
  email_digest: boolean;
}) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: existing } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", user.id)
    .single();

  const current = (existing?.notification_preferences as Record<string, unknown>) || {};

  const { error } = await supabase
    .from("profiles")
    .update({
      notification_preferences: {
        ...current,
        in_app: prefs.in_app,
        email: {
          ...(typeof current.email === "object" && current.email !== null ? current.email : {}),
          immediate: prefs.email_immediate,
          digest: prefs.email_digest,
          frequency: "daily",
          digest_time: "06:00",
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) throw error;

  revalidatePath("/settings");
  revalidatePath("/admin/settings");

  return { success: true };
}

export async function updateMemberDepartments(
  memberId: string,
  departmentId: string | null,
  departmentIds: string[] | null,
  managerType?: "general" | "department" | null
) {
  const { supabase, user } = await getAuthenticatedUser();

  // Ensure current user is an admin
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("user_role, organization_id")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile || currentUserProfile.user_role !== "org_admin") {
    throw new Error("Only admins can modify team member departments.");
  }

  // Ensure target member belongs to the same organisation
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("organization_id, user_role")
    .eq("id", memberId)
    .single();

  if (
    !targetProfile ||
    targetProfile.organization_id !== currentUserProfile.organization_id
  ) {
    throw new Error("Member not found in your organisation.");
  }

  let updatePayload: Record<string, unknown> = {};

  if (targetProfile.user_role === "worker") {
    updatePayload = { department_id: departmentId };
  } else if (targetProfile.user_role === "manager") {
    if (managerType !== undefined) {
      updatePayload.manager_type = managerType;
      // If changing to general manager, clear department_id
      if (managerType === "general") {
        updatePayload.department_id = null;
      } else if (managerType === "department" && departmentId) {
        // If changing to department manager, set department_id
        updatePayload.department_id = departmentId;
      }
    } else {
      // Legacy: just update department_ids
      updatePayload = { department_ids: departmentIds };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", memberId);

  if (error) throw new Error(error.message);

  revalidatePath("/team");
  return { success: true };
}

export async function updateUserTimezone(timezone: string) {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { error } = await supabase
      .from("profiles")
      .update({ timezone })
      .eq("id", user.id);

    if (error) throw new Error(error.message);
    revalidatePath("/settings");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    // Silently fail if not authenticated
    return { success: false };
  }
}
