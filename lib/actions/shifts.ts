"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requireManager, requireUser } from "@/lib/auth-helpers";
import { logAudit } from "./audit";
import { canManagerAccessDepartment } from "@/lib/managers";
import { formatError } from "@/lib/errors";
import {
  triggerShiftAssigned,
  triggerGeneralShiftPosted,
  triggerShiftCompletedNotification,
  triggerShiftApprovedNotification,
} from "./notification-triggers";

export async function autoCloseExpiredShifts(orgId: string) {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Find all shifts that have passed their end_time but aren't closed yet
  const { data: expiredShifts, error: fetchError } = await admin
    .from("shifts")
    .select("id, organization_id, status")
    .eq("organization_id", orgId)
    .lt("end_time", now)
    .in("status", ["not_started", "started"])
    .is("deleted_at", null);

  if (fetchError) throw fetchError;
  if (!expiredShifts || expiredShifts.length === 0) return { count: 0 };

  // Update all expired shifts to "overdue_not_done"
  const { error: updateError } = await admin
    .from("shifts")
    .update({ status: "overdue_not_done" })
    .in("id", expiredShifts.map(s => s.id));

  if (updateError) throw updateError;

  return { count: expiredShifts.length };
}

export async function createShift(formData: {
  organization_id: string;
  department_id: string;
  role_id?: string;
  assigned_to?: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string; // will usually default to 'not_started' now
  notes?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in to perform this action.");

  const { data: shift, error } = await supabase
    .from("shifts")
    .insert({
      ...formData,
      status: "not_started",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(formatError(error.message));

  await logAudit(formData.organization_id, "shift", shift.id, "created", user.id, {
    assigned_to: formData.assigned_to || null,
  });

  // Trigger notifications
  if (formData.assigned_to) {
    // Specific worker assigned - send assignment notification
    await triggerShiftAssigned(shift.id, formData.assigned_to, formData.organization_id);
  } else if (formData.department_id === 'general' || formData.department_id === 'General') {
    // General shift - notify all workers
    await triggerGeneralShiftPosted(shift.id, formData.organization_id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/shifts");

  return { success: true, shiftId: shift.id };
}

export async function softDeleteShift(shiftId: string) {
  const { supabase, user, profile } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("organization_id, department_id")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. It may have been deleted.");

  if (profile.user_role === "manager" && !canManagerAccessDepartment(profile, shift.department_id)) {
    throw new Error("You can only delete shifts within your assigned departments.");
  } else if (profile.user_role === "worker") {
    throw new Error("You don't have permission to delete shifts.");
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "cancelled", deleted_at: new Date().toISOString() })
    .eq("id", shiftId);

  if (error) throw new Error(formatError(error.message));

  await logAudit(shift.organization_id, "shift", shiftId, "soft_deleted", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/shifts");

  return { success: true };
}

export async function bulkSoftDeleteShifts(shiftIds: string[]) {
  if (!shiftIds || shiftIds.length === 0) return { success: true };

  const { supabase, user, profile } = await requireUser();

  const { data: shifts, error: fetchError } = await supabase
    .from("shifts")
    .select("id, organization_id, department_id")
    .in("id", shiftIds);

  if (fetchError || !shifts || shifts.length === 0) throw new Error("The selected shifts could not be found. Please refresh and try again.");

  if (profile.user_role === "worker") {
    throw new Error("You don't have permission to delete shifts.");
  }

  const allowedIds = shifts
    .filter(shift => profile.user_role === "org_admin" || canManagerAccessDepartment(profile, shift.department_id))
    .map(shift => shift.id);

  if (allowedIds.length === 0) {
     throw new Error("You don't have permission to delete the selected shifts. They may belong to departments outside your access.");
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "cancelled", deleted_at: new Date().toISOString() })
    .in("id", allowedIds);

  if (error) throw error;

  for (const shift of shifts) {
     if (allowedIds.includes(shift.id)) {
         await logAudit(shift.organization_id, "shift", shift.id, "soft_deleted_bulk", user.id);
     }
  }

  revalidatePath("/dashboard");
  revalidatePath("/shifts");

  return { success: true, count: allowedIds.length };
}

export async function claimUnassignedShift(shiftId: string) {
  const { supabase, user, profile } = await requireUser();

  if (profile.user_role === "manager" || profile.user_role === "org_admin") {
    throw new Error("Managers and admins cannot claim shifts");
  }

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("organization_id, department_id, assigned_to, status, start_time, end_time")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. It may have been deleted.");
  if (shift.assigned_to) throw new Error("This shift has already been claimed by another team member.");
  if (shift.status !== "not_started") throw new Error("This shift is no longer available to claim.");
  if (profile.department_id !== shift.department_id) throw new Error("You can only claim shifts within your assigned department.");

  // Overlap check
  const { data: overlappingShifts } = await supabase
    .from("shifts")
    .select("id")
    .eq("assigned_to", user.id)
    .is("deleted_at", null)
    .lt("start_time", shift.end_time)
    .gt("end_time", shift.start_time);

  if (overlappingShifts && overlappingShifts.length > 0) {
    throw new Error("You already have a shift scheduled during this time. Please check your schedule before claiming.");
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "pending_approval_claim", assigned_to: user.id })
    .eq("id", shiftId);

  if (error) throw error;

  await logAudit(shift.organization_id, "shift", shiftId, "claim_requested", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  revalidatePath("/my-shifts");

  return { success: true };
}

export async function managerApproveClaim(shiftId: string, approve: boolean) {
  const { supabase, user, profile } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("organization_id, department_id, status, assigned_to")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (shift.status !== "pending_approval_claim") throw new Error("This shift is not awaiting a claim approval.");

  if (profile.user_role === "manager" && !profile.department_ids?.includes(shift.department_id)) {
    throw new Error("Unauthorized to approve this department's claims");
  }

  if (approve) {
    const { error } = await supabase.from("shifts").update({ status: "not_started" }).eq("id", shiftId);
    if (error) throw error;
    await logAudit(shift.organization_id, "shift", shiftId, "claim_approved", user.id, { worker: shift.assigned_to });

    // Send approval notification to worker
    if (shift.assigned_to) {
      await triggerShiftApprovedNotification(shiftId, shift.assigned_to, shift.organization_id);
    }
  } else {
    // Return to unassigned
    const { error } = await supabase.from("shifts").update({ status: "not_started", assigned_to: null }).eq("id", shiftId);
    if (error) throw error;
    await logAudit(shift.organization_id, "shift", shiftId, "claim_rejected", user.id, { worker: shift.assigned_to });
  }

  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  return { success: true };
}

export async function startShift(shiftId: string) {
  const { supabase, user } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("assigned_to, status, organization_id")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (shift.assigned_to !== user.id) throw new Error("You are not assigned to this shift.");
  if (shift.status !== "not_started" && shift.status !== "overdue_not_done") {
    throw new Error("This shift cannot be started from its current state.");
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "started" })
    .eq("id", shiftId);

  if (error) throw new Error(formatError(error.message));

  await logAudit(shift.organization_id, "shift", shiftId, "started", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  revalidatePath("/my-shifts");

  return { success: true };
}

export async function markShiftDone(shiftId: string) {
  const { supabase, user } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("assigned_to, status, organization_id")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (shift.assigned_to !== user.id) throw new Error("You are not assigned to this shift.");
  if (shift.status !== "started" && shift.status !== "not_started" && shift.status !== "overdue_not_done") {
    throw new Error("This shift cannot be marked as done in its current state. Please contact your manager if you think this is an error.");
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "done_pending_approval" })
    .eq("id", shiftId);

  if (error) throw error;

  await logAudit(shift.organization_id, "shift", shiftId, "marked_done", user.id);

  // Send notification to admins/managers
  await triggerShiftCompletedNotification(shiftId, shift.assigned_to, shift.organization_id);

  revalidatePath("/my-shifts");
  revalidatePath("/shifts");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function reviewShiftCompletion(shiftId: string, action: "approve" | "reject" | "no_show", notes?: string) {
  const { supabase, user, profile } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("organization_id, department_id, status")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (profile.user_role === "worker") throw new Error("You don't have permission to review shift completions.");
  if (profile.user_role === "manager" && !canManagerAccessDepartment(profile, shift.department_id)) {
    throw new Error("You can only review completions for shifts within your assigned departments.");
  }

  let newStatus = "";
  if (action === "approve") newStatus = "done_manager_approved";
  else if (action === "reject") newStatus = "done_rejected";
  else if (action === "no_show") newStatus = "no_show";

  const { error } = await supabase
    .from("shifts")
    .update({ status: newStatus, notes: notes ? notes : undefined })
    .eq("id", shiftId);

  if (error) throw error;

  await logAudit(shift.organization_id, "shift", shiftId, `completion_${action}`, user.id, { notes });

  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  revalidatePath("/my-shifts");

  return { success: true };
}

/** Convenience aliases used by manager action buttons */
export async function approveShiftClaim(shiftId: string) {
  return managerApproveClaim(shiftId, true);
}

export async function rejectShiftClaim(shiftId: string) {
  return managerApproveClaim(shiftId, false);
}

export async function approveShiftCompletion(shiftId: string, notes?: string) {
  return reviewShiftCompletion(shiftId, "approve", notes);
}

export async function rejectShiftCompletion(shiftId: string, notes?: string) {
  return reviewShiftCompletion(shiftId, "reject", notes);
}

export async function markNoShow(shiftId: string, notes?: string) {
  return reviewShiftCompletion(shiftId, "no_show", notes);
}
