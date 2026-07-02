"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser, requireManager } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";
import { canManagerAccessDepartment } from "@/lib/managers";
import { formatError } from "@/lib/errors";
import {
  triggerSwapPosted,
  triggerCoverOffered,
  triggerSwapApproved,
  triggerSwapRejected,
  triggerSwapPostedNotification,
} from "./notification-triggers";

export async function requestSwap(shiftId: string, reason: string) {
  const { supabase, user, profile } = await requireUser();

  if (profile.user_role === "manager" || profile.user_role === "org_admin") {
    throw new Error("Managers and admins cannot request shift swaps.");
  }

  const { data: shift, error: shiftError } = await supabase
    .from("shifts")
    .select("id, organization_id, department_id, assigned_to, status")
    .eq("id", shiftId)
    .single();

  if (shiftError || !shift) throw new Error("The requested shift could not be found. It may have been deleted.");
  if (shift.assigned_to !== user.id) throw new Error("You can only request swaps for shifts assigned to you.");
  if (shift.status !== "not_started" && shift.status !== "started") {
    throw new Error("This shift is not eligible for a swap in its current state.");
  }

  if (!profile.organization_id || profile.organization_id !== shift.organization_id) {
    throw new Error("You are not authorized to request a swap for this shift.");
  }

  const { error: insertError } = await supabase.from("swap_requests").insert({
    organization_id: shift.organization_id,
    requester_id: user.id,
    shift_id: shiftId,
    reason,
    status: "pending",
  });

  if (insertError) throw new Error(formatError(insertError.message));

  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("shifts")
    .update({ status: "up_for_swap" })
    .eq("id", shiftId);

  if (updateError) throw new Error(formatError(updateError.message));

  await logAudit(shift.organization_id, "shift", shiftId, "posted_for_swap", user.id, { reason });

  // Get the swap ID that was just created
  const { data: newSwap } = await supabase
    .from("swap_requests")
    .select("id")
    .eq("shift_id", shiftId)
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (newSwap) {
    await triggerSwapPosted(newSwap.id, user.id, shiftId, shift.organization_id);

    // Get shift department for swap notification
    const { data: shiftData } = await supabase
      .from("shifts")
      .select("department_id")
      .eq("id", shiftId)
      .single();

    if (shiftData?.department_id) {
      await triggerSwapPostedNotification(
        newSwap.id,
        user.id,
        shiftId,
        shiftData.department_id,
        shift.organization_id,
        reason
      );
    }
  }

  revalidatePath("/my-shifts");
  revalidatePath("/swap-requests");
  revalidatePath("/swaps");
  return { success: true };
}

export async function offerToCoverSwap(swapId: string) {
  const { supabase, user, profile } = await requireUser();

  if (profile.user_role === "manager" || profile.user_role === "org_admin") {
    throw new Error("Managers and admins cannot offer to cover shifts.");
  }

  const { data: swap, error } = await supabase
    .from("swap_requests")
    .select("id, status, shift_id, organization_id, requester_id")
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("This swap request could not be found. It may have been cancelled or already claimed.");
  if (swap.status !== "pending") throw new Error("This swap is no longer available — it may have already been claimed by another team member.");
  if (swap.requester_id === user.id) throw new Error("You cannot cover your own shift swap request.");

  const { data: shift } = await supabase
    .from("shifts")
    .select("department_id, start_time, end_time")
    .eq("id", swap.shift_id)
    .single();

  if (shift && shift.start_time && shift.end_time) {
    const { data: overlappingShifts } = await supabase
      .from("shifts")
      .select("id")
      .eq("assigned_to", user.id)
      .is("deleted_at", null)
      .lt("start_time", shift.end_time)
      .gt("end_time", shift.start_time);

    if (overlappingShifts && overlappingShifts.length > 0) {
      throw new Error("You already have a shift scheduled during this time. Please check your schedule before offering to cover.");
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

  if (updateError) throw new Error(formatError(updateError.message));

  // Update shift status
  const admin = createAdminClient();
  await admin.from("shifts").update({ status: "pending_approval_swap" }).eq("id", swap.shift_id);

  await logAudit(swap.organization_id, "swap", swapId, "swap_claimed", user.id, { shift_id: swap.shift_id });

  // Get shift requester's manager
  const { data: requester } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", swap.requester_id)
    .single();

  // Get the department to find manager (simplified - assumes one manager per dept)
  const { data: shiftData } = await supabase
    .from("shifts")
    .select("department_id")
    .eq("id", swap.shift_id)
    .single();

  const { data: managers } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_role", "manager")
    .or(`manager_type.eq.general,and(manager_type.eq.department,department_id.eq.${shiftData?.department_id})`)
    .limit(1);

  if (managers && managers.length > 0) {
    await triggerCoverOffered(swapId, swap.requester_id, user.id, managers[0].id, swap.organization_id);
  }

  revalidatePath("/available-shifts");
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

  const admin = createAdminClient();

  const { data: swap, error } = await admin
    .from("swap_requests")
    .select(`
      *,
      shift:shifts!swap_requests_shift_id_fkey(id, title, department_id),
      requester:profiles!requester_id(full_name, email),
      covering_worker:profiles!covering_worker_id(id, full_name)
    `)
    .eq("id", swapId)
    .single();

  if (error || !swap) throw new Error("This swap request could not be found. Please refresh and try again.");

  if (profile.user_role === "manager" && !canManagerAccessDepartment(profile, swap.shift?.department_id)) {
    throw new Error("You don't have permission to manage swaps in this department.");
  } else if (profile.user_role !== "manager" && profile.user_role !== "org_admin") {
    throw new Error("You don't have permission to approve or reject swap requests.");
  }

  const requester = swap.requester as any;
  const shiftTitle = (swap.shift as any)?.title ?? "Shift";

  if (action === "approve") {
    if (swap.status !== "worker_accepted" || !swap.covering_worker_id) {
      throw new Error("Cannot approve this swap because no one has offered to cover it yet.");
    }

    const { error: swapError } = await admin
      .from("swap_requests")
      .update({
        status: "manager_approved",
        approved_by: user.id,
        manager_responded_at: new Date().toISOString(),
        manager_notes: managerNotes || null,
      })
      .eq("id", swapId);

    if (swapError) throw new Error(formatError(swapError.message));

    if (swap.covering_worker_id) {
      const { error: shiftError } = await admin
        .from("shifts")
        .update({ status: "not_started", assigned_to: swap.covering_worker_id })
        .eq("id", swap.shift_id);
      if (shiftError) throw new Error(formatError(shiftError.message));
    }
    await logAudit(swap.organization_id, "swap", swapId, "swap_approved", user.id, { shift_id: swap.shift_id });
    // Trigger notifications
    await triggerSwapApproved(
      swapId,
      swap.requester_id,
      swap.covering_worker_id,
      user.id,
      swap.organization_id,
      managerNotes,
    );
    // Notifications and emails handled by triggerSwapApproved
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

    if (swapError) throw new Error(formatError(swapError.message));

    const nextStatus = blockReswap ? "not_started" : "up_for_swap";

    const { error: shiftError } = await admin
      .from("shifts")
      .update({ status: nextStatus })
      .eq("id", swap.shift_id);

    if (shiftError) throw new Error(formatError(shiftError.message));
    
    await logAudit(swap.organization_id, "swap", swapId, "swap_rejected", user.id, { shift_id: swap.shift_id, block_reswap: blockReswap });
    // Trigger notifications
    await triggerSwapRejected(
      swapId,
      swap.requester_id,
      user.id,
      swap.organization_id,
      blockReswap,
      managerNotes,
    );
    // Notifications and emails handled by triggerSwapRejected
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

  if (error || !swap) throw new Error("This swap request could not be found. It may have already been resolved.");
  if (swap.requester_id !== user.id) throw new Error("You can only cancel your own swap requests.");
  if (swap.status !== "pending") throw new Error("This swap can no longer be cancelled — it has already been accepted by another team member.");

  const { error: swapError } = await supabase
    .from("swap_requests")
    .update({ status: "cancelled" })
    .eq("id", swapId);

  if (swapError) throw new Error(formatError(swapError.message));

  const admin = createAdminClient();
  const { error: shiftError } = await admin
    .from("shifts")
    .update({ status: "not_started" })
    .eq("id", swap.shift_id);

  if (shiftError) throw new Error(formatError(shiftError.message));

  await logAudit(swap.organization_id, "swap", swapId, "swap_cancelled_by_worker", user.id, { shift_id: swap.shift_id });

  revalidatePath("/my-shifts");
  revalidatePath("/swaps");
  return { success: true };
}
