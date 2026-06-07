"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, requireManager } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

async function checkCertification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  departmentId: string | null
) {
  if (!departmentId) return;

  const [{ data: dept }, { data: profile }] = await Promise.all([
    supabase.from("departments").select("requires_certification, name").eq("id", departmentId).single(),
    supabase.from("profiles").select("certifications").eq("id", userId).single(),
  ]);

  if (dept?.requires_certification && (!profile?.certifications || profile.certifications.length === 0)) {
    throw new Error(
      `This shift requires certification for ${dept.name}. Please ask your manager to add your certifications to your profile.`
    );
  }
}

export async function requestSwap(shiftId: string, reason: string) {
  const { supabase, user } = await requireUser();

  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("id, organization_id, department_id, assigned_to, status")
    .eq("id", shiftId)
    .single();

  if (shiftError || !shift) throw new Error("Shift not found");
  if (shift.assigned_to !== user.id) throw new Error("You can only request swaps for your own shifts");
  if (shift.status !== "scheduled") throw new Error("This shift is not available for swap");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.organization_id !== shift.organization_id) {
    throw new Error("Unauthorized");
  }

  await checkCertification(supabase, user.id, shift.department_id);

  const { error: insertError } = await supabase.from("swap_requests").insert({
    organization_id: shift.organization_id,
    requester_id: user.id,
    shift_id: shiftId,
    reason,
    status: "pending",
  });

  if (insertError) throw new Error(insertError.message);

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("shifts")
    .update({ status: "swap_pending" })
    .eq("id", shiftId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/my-shifts");
  revalidatePath("/swap-requests");
  revalidatePath("/swaps");
  return { success: true };
}

export async function offerToCoverSwap(swapId: string) {
  const { supabase, user } = await requireUser();

  const { data: swap, error } = await supabase
    .from("swap_requests")
    .select("id, status, shift_id, organization_id, requester_id")
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("Swap request not found");
  if (swap.status !== "pending") throw new Error("This swap is no longer available");
  if (swap.requester_id === user.id) throw new Error("You cannot cover your own shift");

  const { data: shift } = await supabase
    .from("shifts")
    .select("department_id")
    .eq("id", swap.shift_id)
    .single();

  await checkCertification(supabase, user.id, shift?.department_id ?? null);

  const { error: updateError } = await supabase
    .from("swap_requests")
    .update({
      covering_worker_id: user.id,
      status: "worker_accepted",
      worker_responded_at: new Date().toISOString(),
    })
    .eq("id", swapId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/swaps");
  revalidatePath("/swap-requests");
  return { success: true };
}

export async function managerSwapAction(
  swapId: string,
  action: "approve" | "reject",
  managerNotes?: string
) {
  const { supabase, user } = await requireUser();

  const { data: swap, error } = await supabase
    .from("swap_requests")
    .select("*")
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("Swap request not found");
  await requireManager(swap.organization_id);

  const admin = createAdminClient();

  if (action === "approve") {
    const { error: swapError } = await supabase
      .from("swap_requests")
      .update({
        status: "manager_approved",
        approved_by: user.id,
        manager_responded_at: new Date().toISOString(),
        manager_notes: managerNotes || null,
      })
      .eq("id", swapId);

    if (swapError) throw new Error(swapError.message);

    if (swap.covering_worker_id) {
      const { error: shiftError } = await admin
        .from("shifts")
        .update({ status: "swapped", assigned_to: swap.covering_worker_id })
        .eq("id", swap.shift_id);
      if (shiftError) throw new Error(shiftError.message);
    }
  } else {
    const { error: swapError } = await supabase
      .from("swap_requests")
      .update({
        status: "rejected",
        approved_by: user.id,
        manager_responded_at: new Date().toISOString(),
        manager_notes: managerNotes || null,
      })
      .eq("id", swapId);

    if (swapError) throw new Error(swapError.message);

    const { error: shiftError } = await admin
      .from("shifts")
      .update({ status: "scheduled" })
      .eq("id", swap.shift_id);
    if (shiftError) throw new Error(shiftError.message);
  }

  revalidatePath("/swaps");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelSwapRequest(swapId: string) {
  const { supabase, user } = await requireUser();

  const { data: swap, error } = await supabase
    .from("swap_requests")
    .select("id, requester_id, shift_id, status")
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("Swap request not found");
  if (swap.requester_id !== user.id) throw new Error("Unauthorized");
  if (swap.status !== "pending") throw new Error("This swap can no longer be cancelled");

  const { error: swapError } = await supabase
    .from("swap_requests")
    .update({ status: "cancelled" })
    .eq("id", swapId);

  if (swapError) throw new Error(swapError.message);

  const admin = createAdminClient();
  const { error: shiftError } = await admin
    .from("shifts")
    .update({ status: "scheduled" })
    .eq("id", swap.shift_id);

  if (shiftError) throw new Error(shiftError.message);

  revalidatePath("/my-shifts");
  revalidatePath("/swaps");
  return { success: true };
}
