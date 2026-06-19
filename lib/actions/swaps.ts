"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, requireManager } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";
import { sendSwapApprovedEmail, sendSwapRejectedEmail } from "@/lib/email";

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
  if (shift.status !== "not_started" && shift.status !== "started") {
    throw new Error("This shift is not available for swap");
  }

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
    .update({ status: "up_for_swap" })
    .eq("id", shiftId);

  if (updateError) throw new Error(updateError.message);

  await logAudit(shift.organization_id, "shift", shiftId, "posted_for_swap", user.id, { reason });

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
    .select("department_id, start_time, end_time")
    .eq("id", swap.shift_id)
    .single();

  await checkCertification(supabase, user.id, shift?.department_id ?? null);

  if (shift && shift.start_time && shift.end_time) {
    const { data: overlappingShifts } = await supabase
      .from("shifts")
      .select("id")
      .eq("assigned_to", user.id)
      .is("deleted_at", null)
      .lt("start_time", shift.end_time)
      .gt("end_time", shift.start_time);

    if (overlappingShifts && overlappingShifts.length > 0) {
      throw new Error("You are already scheduled for a shift that overlaps with this time.");
    }
  }

  // Lock the swap (first come first serve)
  const { error: updateError } = await supabase
    .from("swap_requests")
    .update({
      covering_worker_id: user.id,
      status: "worker_accepted",
      worker_responded_at: new Date().toISOString(),
    })
    .eq("id", swapId)
    .eq("status", "pending"); // ensure it's still pending

  if (updateError) throw new Error(updateError.message);

  // Update shift status
  const admin = createAdminClient();
  await admin.from("shifts").update({ status: "pending_approval_swap" }).eq("id", swap.shift_id);

  await logAudit(swap.organization_id, "swap", swapId, "swap_claimed", user.id, { shift_id: swap.shift_id });

  revalidatePath("/swaps");
  revalidatePath("/swap-requests");
  return { success: true };
}

export async function managerSwapAction(
  swapId: string,
  action: "approve" | "reject",
  managerNotes?: string,
  blockReswap: boolean = false
) {
  const { supabase, user, profile } = await requireUser();

  const { data: swap, error } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(id, title, department_id), requester:profiles!swap_requests_requester_id_fkey(full_name, email)")
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("Swap request not found");

  if (profile.user_role === "manager" && !profile.department_ids?.includes(swap.shift?.department_id)) {
    throw new Error("Unauthorized to manage swaps in this department");
  }

  const requester = swap.requester as any;
  const shiftTitle = (swap.shift as any)?.title ?? "Shift";

  const admin = createAdminClient();

  if (action === "approve") {
    const { error: swapError } = await admin
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
    await logAudit(swap.organization_id, "swap", swapId, "swap_approved", user.id, { shift_id: swap.shift_id });
    // Notify requester by email
    if (requester?.email) {
      await sendSwapApprovedEmail(requester.email, requester.full_name, shiftTitle);
    }
  } else {
    // Reject
    const { error: swapError } = await admin
      .from("swap_requests")
      .update({
        status: "rejected",
        approved_by: user.id,
        manager_responded_at: new Date().toISOString(),
        manager_notes: managerNotes || null,
      })
      .eq("id", swapId);

    if (swapError) throw new Error(swapError.message);

    const nextStatus = blockReswap ? "not_started" : "up_for_swap";

    const { error: shiftError } = await admin
      .from("shifts")
      .update({ status: nextStatus })
      .eq("id", swap.shift_id);

    if (shiftError) throw new Error(shiftError.message);
    
    await logAudit(swap.organization_id, "swap", swapId, "swap_rejected", user.id, { shift_id: swap.shift_id, block_reswap: blockReswap });
    // Notify requester by email
    if (requester?.email) {
      await sendSwapRejectedEmail(requester.email, requester.full_name, shiftTitle);
    }
  }

  revalidatePath("/swaps");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelSwapRequest(swapId: string) {
  const { supabase, user } = await requireUser();

  const { data: swap, error } = await supabase
    .from("swap_requests")
    .select("id, requester_id, shift_id, status, organization_id")
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("Swap request not found");
  if (swap.requester_id !== user.id) throw new Error("Unauthorized");
  if (swap.status !== "pending") throw new Error("This swap can no longer be cancelled. Someone has already claimed it.");

  const { error: swapError } = await supabase
    .from("swap_requests")
    .update({ status: "cancelled" })
    .eq("id", swapId);

  if (swapError) throw new Error(swapError.message);

  const admin = createAdminClient();
  const { error: shiftError } = await admin
    .from("shifts")
    .update({ status: "not_started" })
    .eq("id", swap.shift_id);

  if (shiftError) throw new Error(shiftError.message);

  await logAudit(swap.organization_id, "swap", swapId, "swap_cancelled_by_worker", user.id, { shift_id: swap.shift_id });

  revalidatePath("/my-shifts");
  revalidatePath("/swaps");
  return { success: true };
}
