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
  const { profile } = await requireUser();
  if (!profile?.organization_id || profile.organization_id !== orgId) {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const submissionCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const [{ data: missedShifts, error: missedFetchError }, { data: overdueShifts, error: overdueFetchError }] = await Promise.all([
    // A shift that was never started is automatically a no-show as soon as it ends.
    admin
      .from("shifts")
      .select("id")
      .eq("organization_id", orgId)
      .lt("end_time", now)
      .eq("status", "not_started")
      .is("deleted_at", null),
    // A started shift has a 15-minute grace period to be submitted.
    admin
      .from("shifts")
      .select("id")
      .eq("organization_id", orgId)
      .lt("end_time", submissionCutoff)
      .eq("status", "started")
      .is("deleted_at", null),
  ]);

  if (missedFetchError) throw missedFetchError;
  if (overdueFetchError) throw overdueFetchError;

  const noShowIds = (missedShifts ?? []).map((shift) => shift.id);
  const overdueIds = (overdueShifts ?? []).map((shift) => shift.id);
  if (noShowIds.length === 0 && overdueIds.length === 0) return { count: 0 };

  const updates = [];
  if (noShowIds.length > 0) {
    updates.push(admin.from("shifts").update({ status: "no_show" }).in("id", noShowIds));
  }
  if (overdueIds.length > 0) {
    updates.push(admin.from("shifts").update({ status: "overdue_not_done" }).in("id", overdueIds));
  }

  const results = await Promise.all(updates);
  const updateError = results.find((result) => result.error)?.error;
  if (updateError) throw updateError;

  return { count: noShowIds.length + overdueIds.length };
}

export async function createShift(formData: {
  organization_id: string;
  department_id: string;

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

  // Fetch department to check if it's "general"
  let isGeneralDept = shift.department_id === null;
  if (shift.department_id) {
    const { data: dept } = await supabase.from("departments").select("name").eq("id", shift.department_id).single();
    if (dept?.name?.toLowerCase() === "general") {
      isGeneralDept = true;
    }
  }

  // Allow claiming if the shift is in the worker's own department OR the General department
  const workerDeptId = profile.department_id;
  if (workerDeptId && workerDeptId !== shift.department_id) {
    if (!isGeneralDept) {
      throw new Error("You can only claim shifts within your assigned department.");
    }
  } else if (!workerDeptId && !isGeneralDept) {
    throw new Error("You can only claim general shifts since you are not assigned to a department.");
  }

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

  const admin = createAdminClient();
  const { data: claimedShift, error } = await admin
    .from("shifts")
    .update({ status: "pending_approval_claim", assigned_to: user.id })
    .eq("id", shiftId)
    .is("assigned_to", null)
    .eq("status", "not_started")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!claimedShift) throw new Error("This shift was just claimed by another team member.");

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

  if (profile.user_role !== "manager" && profile.user_role !== "org_admin") {
    throw new Error("You don't have permission to approve shift claims.");
  }

  if (profile.user_role === "manager" && !canManagerAccessDepartment(profile, shift.department_id)) {
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
    .select("assigned_to, status, organization_id, start_time, end_time")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (shift.assigned_to !== user.id) throw new Error("You are not assigned to this shift.");
  if (shift.status !== "not_started") {
    throw new Error("This shift cannot be started from its current state.");
  }
  
  const now = new Date();
  if (now < new Date(shift.start_time)) {
    throw new Error("Shift can't start before its time.");
  }
  if (now.getTime() > new Date(shift.end_time).getTime()) {
    await createAdminClient().from("shifts").update({ status: "no_show" }).eq("id", shiftId);
    throw new Error("This shift has ended and was automatically marked as a no-show.");
  }

  const admin = createAdminClient();
  const isLateStart = now.getTime() > new Date(shift.start_time).getTime() + 5 * 60 * 1000;
  const { error } = await admin
    .from("shifts")
    .update({
      status: "started",
      actual_start_time: now.toISOString(),
      late_started_at: isLateStart ? now.toISOString() : null,
    })
    .eq("id", shiftId);

  if (error) throw new Error(formatError(error.message));

  await logAudit(shift.organization_id, "shift", shiftId, "started", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/shifts");
  revalidatePath("/my-shifts");

  return { success: true, lateStarted: isLateStart };
}

export async function enforceShiftSubmissionDeadline(shiftId: string) {
  const { supabase, user } = await requireUser();
  const { data: shift, error } = await supabase
    .from("shifts")
    .select("assigned_to, status, end_time")
    .eq("id", shiftId)
    .single();

  if (error || !shift || shift.assigned_to !== user.id) return { updated: false };
  if (!["not_started", "started"].includes(shift.status)) return { updated: false };

  const now = Date.now();
  const endTime = new Date(shift.end_time).getTime();
  const terminalStatus = shift.status === "not_started"
    ? now > endTime ? "no_show" : null
    : now > endTime + 15 * 60 * 1000 ? "overdue_not_done" : null;
  if (!terminalStatus) return { updated: false };

  const { error: updateError } = await createAdminClient()
    .from("shifts")
    .update({ status: terminalStatus })
    .eq("id", shiftId);

  if (updateError) throw new Error(formatError(updateError.message));

  revalidatePath("/my-shifts");
  revalidatePath("/shifts");
  revalidatePath("/dashboard");
  return { updated: true };
}

export async function markShiftDone(shiftId: string) {
  const { supabase, user } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("assigned_to, status, organization_id, end_time")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (shift.assigned_to !== user.id) throw new Error("You are not assigned to this shift.");
  if (shift.status !== "started" && shift.status !== "not_started") {
    throw new Error("This shift cannot be marked as done in its current state. Please contact your manager if you think this is an error.");
  }

  const now = new Date();
  if (now.getTime() > new Date(shift.end_time).getTime() + 15 * 60 * 1000) {
    await createAdminClient().from("shifts").update({ status: "overdue_not_done" }).eq("id", shiftId);
    throw new Error("This shift is overdue and can no longer be submitted. Please contact your manager.");
  }

  const admin = createAdminClient();
  const isLateSubmission = now.getTime() > new Date(shift.end_time).getTime() + 5 * 60 * 1000;
  const { error } = await admin
    .from("shifts")
    .update({
      status: "done_pending_approval",
      actual_end_time: now.toISOString(),
      late_submitted_at: isLateSubmission ? now.toISOString() : null,
    })
    .eq("id", shiftId);

  if (error) throw error;

  await logAudit(shift.organization_id, "shift", shiftId, "marked_done", user.id);

  // Send notification to admins/managers
  await triggerShiftCompletedNotification(shiftId, shift.assigned_to, shift.organization_id);

  revalidatePath("/my-shifts");
  revalidatePath("/shifts");
  revalidatePath("/dashboard");

  return { success: true, lateSubmitted: isLateSubmission };
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

export async function cancelShiftClaim(shiftId: string) {
  const { supabase, user } = await requireUser();

  const { data: shift, error: fetchError } = await supabase
    .from("shifts")
    .select("organization_id, department_id, status, assigned_to")
    .eq("id", shiftId)
    .single();

  if (fetchError || !shift) throw new Error("The requested shift could not be found. Please refresh and try again.");
  if (shift.status !== "pending_approval_claim") throw new Error("This claim is no longer pending and cannot be cancelled.");
  if (shift.assigned_to !== user.id) throw new Error("You can only cancel your own claim.");

  const admin = createAdminClient();
  const { error } = await admin
    .from("shifts")
    .update({ status: "not_started", assigned_to: null })
    .eq("id", shiftId);

  if (error) throw error;

  await logAudit(shift.organization_id, "shift", shiftId, "claim_cancelled", user.id);

  revalidatePath("/my-shifts");
  revalidatePath("/available-shifts");
  revalidatePath("/dashboard");

  return { success: true };
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
