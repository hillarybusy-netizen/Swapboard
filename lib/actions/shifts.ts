"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createShift(formData: {
  organization_id: string;
  department_id: string;
  role_id?: string;
  assigned_to?: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("shifts")
    .insert({
      ...formData,
      created_by: user.id,
    });

  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/shifts");

  return { success: true };
}

/** Worker: request manager confirmation that a shift is done. */
export async function markShiftPendingCompletion(shiftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Only the assigned worker can request completion
  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("assigned_to, status")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("Shift not found");
  if (shift.assigned_to !== user.id) throw new Error("You are not assigned to this shift");
  if (shift.status !== "scheduled") throw new Error("Shift cannot be marked as done from its current status");

  const { error } = await supabase
    .from("shifts")
    .update({ status: "pending_completion" })
    .eq("id", shiftId);

  if (error) throw error;

  revalidatePath("/my-shifts");
  revalidatePath("/shifts");
  revalidatePath("/dashboard");

  return { success: true };
}

/** Manager: confirm a shift is completed. */
export async function approveShiftCompletion(shiftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_role")
    .eq("id", user.id)
    .single();

  if (!profile || !["manager", "admin"].includes(profile.user_role)) {
    throw new Error("Only managers can approve shift completions");
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "completed" })
    .eq("id", shiftId)
    .eq("status", "pending_completion");

  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  revalidatePath("/my-shifts");

  return { success: true };
}
