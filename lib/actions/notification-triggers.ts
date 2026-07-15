import "server-only";

import type { NotificationType } from "./notifications";
import { createNotification } from "@/lib/notifications/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendSwapApprovedEmail,
  sendSwapRejectedEmail,
  sendShiftAssignedEmail,
  sendPendingApprovalEmail,
  sendGeneralShiftAvailableEmail,
  sendSwapPostedEmail,
  sendSwapOfferEmail,
  sendShiftCompletedEmail,
  sendShiftCreatedAdminEmail,
  sendSwapPostedConfirmationEmail,
  sendSwapPostedAdminEmail,
  sendCoverOfferedConfirmationEmail,
  sendSwapApprovedAdminEmail,
  sendShiftStartingSoonEmail,
  sendShiftOverdueEmail,
  sendShiftCompletionApprovedEmail,
} from "@/lib/email";

interface NotificationTriggerOptions {
  email?: boolean;
  realtime?: boolean;
  inApp?: boolean;
}

const DEFAULT_OPTIONS: NotificationTriggerOptions = {
  email: true,
  realtime: true,
  inApp: true,
};

/**
 * Helper to check user notification preferences
 */
async function shouldSendNotification(
  userId: string,
  channel: 'email' | 'in_app',
  notificationType: NotificationType,
) {
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from('profiles')
    .select('notification_preferences')
    .eq('id', userId)
    .single();

  if (error || !profile) return true; // Default to sending if we can't check

  const prefs = profile.notification_preferences || {};

  // Check if channel is enabled globally.
  // Support both the old flat format { email: true } and the new nested format
  // { email: { immediate: true } } — users created before migration 020 may
  // still have the old format, which would make `prefs.email?.immediate`
  // evaluate to `undefined` (falsy) and silently block all emails.
  if (channel === 'email') {
    const emailPref = prefs.email;
    if (emailPref === false) return false; // explicitly disabled
    if (emailPref === true || emailPref == null) {
      // old flat format or missing → treat as enabled
    } else if (typeof emailPref === 'object' && emailPref.immediate === false) {
      return false; // new nested format with immediate: false
    }
  }
  if (channel === 'in_app' && !prefs.in_app) return false;

  // Check if notification type is muted
  if (prefs.mute_types?.includes(notificationType)) return false;

  return true;
}

/**
 * Get user profile for notifications
 */
async function getUserProfile(userId: string) {
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, email, full_name, organization_id')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return profile;
}

/**
 * Get all admins and managers in an organization
 */
async function getAdminsAndManagers(organizationId: string) {
  const admin = createAdminClient();
  
  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('organization_id', organizationId)
    .in('user_role', ['org_admin', 'manager']);
  
  return data || [];
}

/**
 * Get workers in a specific department
 */
async function getWorkersInDepartment(departmentId: string) {
  const admin = createAdminClient();
  
  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, department_id')
    .eq('department_id', departmentId)
    .eq('user_role', 'worker');
  
  return data || [];
}

/**
 * Get all org admins + managers who manage a specific department
 */
async function getAdminsAndDepartmentManagers(organizationId: string, departmentId: string) {
  const admin = createAdminClient();

  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, department_id, manager_type, user_role')
    .eq('organization_id', organizationId)
    .in('user_role', ['org_admin', 'manager']);

  if (!data) return [];

  // Org admins and general managers see everything; department managers only
  // receive notifications for their own department.
  return data.filter(
    (u) => u.user_role === 'org_admin' || u.manager_type === 'general' || u.department_id === departmentId,
  );
}

/**
 * Notify all admins and managers in organization
 */
async function notifyAdminsAndManagers(
  organizationId: string,
  notificationType: NotificationType,
  title: string,
  message: string,
  relatedEntityType?: 'shift' | 'swap_request',
  relatedEntityId?: string,
) {
  const adminsAndManagers = await getAdminsAndManagers(organizationId);
  
  for (const user of adminsAndManagers) {
    await createNotification({
      userId: user.id,
      organizationId,
      type: notificationType,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
    });
  }
}

// ============================================================================
// SWAP NOTIFICATIONS
// ============================================================================

/**
 * Swap posted by worker (requester notification)
 */
export async function triggerSwapPosted(
  swapId: string,
  requesterUserId: string,
  shiftId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  // Fetch shift details
  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time')
    .eq('id', shiftId)
    .single();

  const title = 'Swap Posted';
  const message = `You've posted "${shift?.title || 'Shift'}" for swap. Waiting for a worker to offer to cover.`;

  await createNotification({
    userId: requesterUserId,
    organizationId,
    type: 'swap_posted',
    title,
    message,
    relatedEntityType: 'swap_request',
    relatedEntityId: swapId,
  });

  // Email the requester (Worker 1) confirming their shift is posted
  const { data: requesterProfile } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', requesterUserId)
    .single();

  if (requesterProfile?.email) {
    const dateStr = new Date(shift?.start_time || '').toLocaleDateString();
    await sendSwapPostedConfirmationEmail(
      requesterProfile.email,
      requesterProfile.full_name || 'Worker',
      shift?.title || 'Shift',
      dateStr,
    );
  }
}

/**
 * Worker offered to cover swap (manager approval pending)
 */
export async function triggerCoverOffered(
  swapId: string,
  requesterUserId: string,
  coverWorkerId: string,
  managerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  // Fetch required data
  const { data: swap } = await admin
    .from('swap_requests')
    .select('shift_id, reason')
    .eq('id', swapId)
    .single();

  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time, department_id')
    .eq('id', swap?.shift_id)
    .single();

  const { data: requester } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', requesterUserId)
    .single();

  const { data: coverWorker } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', coverWorkerId)
    .single();

  const { data: manager } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', managerId)
    .single();

  const shiftTitle = shift?.title || 'Shift';
  const shiftDateStr = new Date(shift?.start_time || '').toLocaleDateString();

  // Notify requester (Worker 1) in-app
  await createNotification({
    userId: requesterUserId,
    organizationId,
    type: 'cover_offered',
    title: 'Cover Offered',
    message: `${coverWorker?.full_name || 'A worker'} has offered to cover "${shiftTitle}". Your manager will review this soon.`,
    relatedEntityType: 'swap_request',
    relatedEntityId: swapId,
  });

  // Email Worker 1 — someone wants to cover their shift
  if (requester?.email) {
    await sendSwapOfferEmail(
      requester.email,
      requester.full_name || 'Worker',
      coverWorker?.full_name || 'A worker',
      shiftTitle,
    );
  }

  // Email Worker 2 (cover worker) — confirmation their offer was submitted
  if (coverWorker?.email) {
    await sendCoverOfferedConfirmationEmail(
      coverWorker.email,
      coverWorker.full_name || 'Worker',
      requester?.full_name || 'A worker',
      shiftTitle,
      shiftDateStr,
    );
  }

  // Notify all relevant admins & managers (department-scoped)
  const departmentManagers = await getAdminsAndDepartmentManagers(organizationId, shift?.department_id || '');

  for (const mgr of departmentManagers) {
    await createNotification({
      userId: mgr.id,
      organizationId,
      type: 'swap_approval_pending',
      title: 'Swap Request Pending Approval',
      message: `${coverWorker?.full_name || 'A worker'} has offered to cover "${shiftTitle}" from ${requester?.full_name || 'a worker'}. This swap is pending your approval.`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (mgr.email) {
      await sendPendingApprovalEmail(
        mgr.email,
        mgr.full_name || 'Manager',
        coverWorker?.full_name || 'A worker',
        requester?.full_name || 'A worker',
        shiftTitle,
        swap?.reason,
      );
    }
  }
}

/**
 * Swap approved by manager
 */
export async function triggerSwapApproved(
  swapId: string,
  requesterUserId: string,
  coverWorkerId: string,
  managerId: string,
  organizationId: string,
  managerNotes?: string,
) {
  const admin = createAdminClient();

  // Fetch required data (include start_time for the date string)
  const swapRecord = await admin.from('swap_requests').select('shift_id').eq('id', swapId).single();
  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time, department_id')
    .eq('id', swapRecord.data?.shift_id)
    .single();

  const { data: requester } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', requesterUserId)
    .single();

  const { data: coverWorker } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', coverWorkerId)
    .single();

  const { data: manager } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', managerId)
    .single();

  const shiftTitle = shift?.title || 'Shift';
  const shiftDateStr = new Date(shift?.start_time || '').toLocaleDateString();

  // Notify & email all department-scoped admins/managers about the approved swap
  const departmentManagers = await getAdminsAndDepartmentManagers(
    organizationId,
    shift?.department_id || '',
  );

  for (const mgr of departmentManagers) {
    await createNotification({
      userId: mgr.id,
      organizationId,
      type: 'swap_approved',
      title: 'Swap Approved',
      message: `${manager?.full_name || 'A manager'} approved swap: ${requester?.full_name || 'Worker'} ↔ ${coverWorker?.full_name || 'Worker'} for "${shiftTitle}".`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (mgr.email) {
      await sendSwapApprovedAdminEmail(
        mgr.email,
        mgr.full_name || 'Admin',
        manager?.full_name || 'Manager',
        requester?.full_name || 'Worker',
        coverWorker?.full_name || 'Worker',
        shiftTitle,
        shiftDateStr,
        managerNotes,
      );
    }
  }

  // Notify requester
  if (await shouldSendNotification(requesterUserId, 'email', 'swap_approved')) {
    await createNotification({
      userId: requesterUserId,
      organizationId,
      type: 'swap_approved',
      title: 'Swap Approved ✅',
      message: `Your swap for "${shiftTitle}" has been approved by ${manager?.full_name || 'your manager'}. The shift is now assigned to ${coverWorker?.full_name || 'the covering worker'}.`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (requester?.email) {
      await sendSwapApprovedEmail(
        requester.email,
        requester.full_name || 'Worker',
        requester.full_name || 'You',
        shiftTitle,
        manager?.full_name || 'Manager',
        managerNotes,
      );
    }
  }

  // Notify covering worker
  if (await shouldSendNotification(coverWorkerId, 'email', 'swap_approved')) {
    await createNotification({
      userId: coverWorkerId,
      organizationId,
      type: 'swap_approved',
      title: 'Swap Approved ✅',
      message: `Your approved swap for "${shiftTitle}" has been confirmed. The shift is now assigned to you.`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (coverWorker?.email) {
      await sendSwapApprovedEmail(
        coverWorker.email,
        coverWorker.full_name || 'Worker',
        requester?.full_name || 'The worker',
        shiftTitle,
        manager?.full_name || 'Manager',
        managerNotes,
      );
    }
  }
}

/**
 * Swap rejected by manager
 */
export async function triggerSwapRejected(
  swapId: string,
  requesterUserId: string,
  managerId: string,
  organizationId: string,
  blockReswap: boolean = false,
  managerNotes?: string,
) {
  const admin = createAdminClient();

  const { data: swap } = await admin
    .from('swap_requests')
    .select('shift_id')
    .eq('id', swapId)
    .single();

  const { data: shift } = await admin
    .from('shifts')
    .select('title')
    .eq('id', swap?.shift_id)
    .single();

  const { data: requester } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', requesterUserId)
    .single();

  const { data: manager } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', managerId)
    .single();

  const shiftTitle = shift?.title || 'Shift';

  if (await shouldSendNotification(requesterUserId, 'email', 'swap_rejected')) {
    await createNotification({
      userId: requesterUserId,
      organizationId,
      type: 'swap_rejected',
      title: 'Swap Declined',
      message: blockReswap
        ? `Your swap for "${shiftTitle}" has been declined and is now locked. You cannot re-post this shift for swap.`
        : `Your swap for "${shiftTitle}" has been declined. You can try posting it for swap again.`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (requester?.email) {
      await sendSwapRejectedEmail(
        requester.email,
        requester.full_name || 'Worker',
        shiftTitle,
        manager?.full_name || 'Manager',
        managerNotes,
        !blockReswap,
      );
    }
  }
}

// ============================================================================
// SHIFT NOTIFICATIONS
// ============================================================================

/**
 * Shift assigned to worker
 */
export async function triggerShiftAssigned(
  shiftId: string,
  workerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time, end_time, notes, department_id, created_by')
    .eq('id', shiftId)
    .single();

  const { data: dept } = await admin
    .from('departments')
    .select('name')
    .eq('id', shift?.department_id)
    .single();

  const { data: worker } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', workerId)
    .single();

  if (!shift || !worker) return;

  const startDate = new Date(shift.start_time);
  const endDate = new Date(shift.end_time);
  const dateStr = startDate.toLocaleDateString();
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (await shouldSendNotification(workerId, 'email', 'shift_assigned')) {
    await createNotification({
      userId: workerId,
      organizationId,
      type: 'shift_assigned',
      title: 'New Shift Assigned',
      message: `You've been assigned to "${shift.title}" on ${dateStr} at ${timeStr}`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });

    if (worker.email) {
      await sendShiftAssignedEmail(
        worker.email,
        worker.full_name || 'Worker',
        shift.title,
        dateStr,
        timeStr,
        dept?.name,
        shift.notes,
      );
    }
  }

  // Notify admins and managers
  const { data: creator } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', shift?.created_by)
    .single();
  const creatorName = creator?.full_name || 'System';

  const adminsAndManagers = await getAdminsAndManagers(organizationId);
  for (const am of adminsAndManagers) {
    if (await shouldSendNotification(am.id, 'email', 'shift_assigned')) {
      if (am.email) {
        await sendShiftCreatedAdminEmail(
          am.email,
          am.full_name || 'Admin',
          worker.full_name || 'Worker',
          creatorName,
          shift.title,
          dateStr,
          timeStr,
          dept?.name,
          shift.notes,
        );
      }
    }
  }
}

/**
 * Shift starting soon reminder (called by cron)
 */
export async function triggerShiftStartingSoon(
  shiftId: string,
  workerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time')
    .eq('id', shiftId)
    .single();

  const { data: worker } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', workerId)
    .single();

  if (!shift || !worker) return;

  const startDate = new Date(shift.start_time);
  const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (await shouldSendNotification(workerId, 'email', 'shift_starting_soon')) {
    await createNotification({
      userId: workerId,
      organizationId,
      type: 'shift_starting_soon',
      title: '⏰ Shift Starting Soon',
      message: `Reminder: "${shift.title}" starts at ${timeStr}. See you soon!`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });

    if (worker.email) {
      await sendShiftStartingSoonEmail(
        worker.email,
        worker.full_name || 'Worker',
        shift.title,
        timeStr,
      );
    }
  }
}

/**
 * Shift overdue alert (called by cron)
 */
export async function triggerShiftOverdue(
  shiftId: string,
  assignedToId: string,
  managerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  const { data: shift } = await admin
    .from('shifts')
    .select('title, end_time')
    .eq('id', shiftId)
    .single();

  if (!shift) return;

  const endedAtStr = new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Notify worker
  const { data: workerProfile } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', assignedToId)
    .single();

  if (await shouldSendNotification(assignedToId, 'in_app', 'shift_overdue')) {
    await createNotification({
      userId: assignedToId,
      organizationId,
      type: 'shift_overdue',
      title: '⚠️ Shift Overdue',
      message: `Your shift "${shift.title}" ended ${endedAtStr}. Please mark it as done.`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });
  }

  if (await shouldSendNotification(assignedToId, 'email', 'shift_overdue')) {
    if (workerProfile?.email) {
      await sendShiftOverdueEmail(
        workerProfile.email,
        workerProfile.full_name || 'Worker',
        shift.title,
        endedAtStr,
        'worker',
      );
    }
  }

  // Notify manager
  const { data: managerProfile } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', managerId)
    .single();

  if (await shouldSendNotification(managerId, 'in_app', 'shift_overdue')) {
    await createNotification({
      userId: managerId,
      organizationId,
      type: 'shift_overdue',
      title: '⚠️ Shift Overdue',
      message: `Shift "${shift.title}" is overdue and not marked complete. Please follow up.`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });
  }

  if (await shouldSendNotification(managerId, 'email', 'shift_overdue')) {
    if (managerProfile?.email) {
      await sendShiftOverdueEmail(
        managerProfile.email,
        managerProfile.full_name || 'Manager',
        shift.title,
        endedAtStr,
        'manager',
      );
    }
  }
}

// ============================================================================
// COMPLETION NOTIFICATIONS
// ============================================================================

/**
 * Shift completion pending manager approval
 */
export async function triggerCompletionPending(
  shiftId: string,
  managerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  const { data: shift } = await admin
    .from('shifts')
    .select('title, assigned_to')
    .eq('id', shiftId)
    .single();

  const { data: worker } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', shift?.assigned_to)
    .single();

  const { data: managerForPending } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', managerId)
    .single();

  if (await shouldSendNotification(managerId, 'in_app', 'shift_completion_pending')) {
    await createNotification({
      userId: managerId,
      organizationId,
      type: 'shift_completion_pending',
      title: 'Shift Completion Pending Approval',
      message: `${worker?.full_name || 'A worker'} marked "${shift?.title}" as complete. Please review and approve.`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });
  }

  if (await shouldSendNotification(managerId, 'email', 'shift_completion_pending')) {
    if (managerForPending?.email) {
      await sendShiftCompletedEmail(
        managerForPending.email,
        managerForPending.full_name || 'Manager',
        worker?.full_name || 'A worker',
        shift?.title || 'Shift',
        'manager',
      );
    }
  }
}

/**
 * Shift completion approved
 */
export async function triggerCompletionApproved(
  shiftId: string,
  workerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  const { data: shift } = await admin
    .from('shifts')
    .select('title')
    .eq('id', shiftId)
    .single();

  const { data: workerForApproval } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', workerId)
    .single();

  // Fetch the manager who approved (from the shift)
  const { data: approvedShift } = await admin
    .from('shifts')
    .select('created_by')
    .eq('id', shiftId)
    .single();

  // Best-effort: use the org's first admin name as fallback for managerName
  const { data: approverProfile } = approvedShift?.created_by
    ? await admin.from('profiles').select('full_name').eq('id', approvedShift.created_by).single()
    : { data: null };

  if (await shouldSendNotification(workerId, 'in_app', 'completion_approved')) {
    await createNotification({
      userId: workerId,
      organizationId,
      type: 'completion_approved',
      title: 'Shift Completion Approved ✅',
      message: `Your completion for "${shift?.title}" has been approved.`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });
  }

  if (await shouldSendNotification(workerId, 'email', 'completion_approved')) {
    if (workerForApproval?.email) {
      await sendShiftCompletionApprovedEmail(
        workerForApproval.email,
        workerForApproval.full_name || 'Worker',
        shift?.title || 'Shift',
        approverProfile?.full_name || 'Your manager',
      );
    }
  }
}

// ============================================================================
// GENERAL SHIFT & SWAP POSTED NOTIFICATIONS
// ============================================================================

/**
 * General shift posted (unassigned shift for all workers to claim)
 * Also notifies all admins and managers
 */
export async function triggerGeneralShiftPosted(
  shiftId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  // Fetch shift details
  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time, end_time, notes')
    .eq('id', shiftId)
    .single();

  if (!shift) return;

  const startDate = new Date(shift.start_time);
  const endDate = new Date(shift.end_time);
  const dateStr = startDate.toLocaleDateString();
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Notify all admins and managers
  await notifyAdminsAndManagers(
    organizationId,
    'shift_assigned',
    'General Shift Posted',
    `"${shift.title}" is available to claim on ${dateStr} at ${timeStr}.`,
    'shift',
    shiftId,
  );

  // Get all workers in organization
  const { data: workers } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('organization_id', organizationId)
    .eq('user_role', 'worker');

  if (!workers || workers.length === 0) return;

  // Notify each worker
  for (const worker of workers) {
    await createNotification({
      userId: worker.id,
      organizationId,
      type: 'shift_assigned',
      title: 'General Shift Available',
      message: `"${shift.title}" is available to claim on ${dateStr} at ${timeStr}. Claim it now!`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });

    // Send email if notifications enabled
    if (await shouldSendNotification(worker.id, 'email', 'shift_assigned')) {
      if (worker.email) {
        await sendGeneralShiftAvailableEmail(
          worker.email,
          worker.full_name || 'Worker',
          shift.title,
          dateStr,
          timeStr,
          'General',
          shift.notes,
        );
      }
    }
  }
}

/**
 * Shift posted for swap (notify department workers and all admins/managers)
 */
export async function triggerSwapPostedNotification(
  swapId: string,
  requesterUserId: string,
  shiftId: string,
  departmentId: string,
  organizationId: string,
  reason?: string,
) {
  const admin = createAdminClient();

  // Fetch shift and requester details
  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time, department_id')
    .eq('id', shiftId)
    .single();

  const { data: requester } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', requesterUserId)
    .single();

  if (!shift || !requester) return;

  const startDate = new Date(shift.start_time);
  const dateStr = startDate.toLocaleDateString();

  // Email Worker 1 confirming their shift is posted for swap
  if (requester.email) {
    await sendSwapPostedConfirmationEmail(
      requester.email,
      requester.full_name || 'Worker',
      shift.title,
      dateStr,
    );
  }

  // Notify & email department-scoped admins/managers
  const deptAdmins = await getAdminsAndDepartmentManagers(organizationId, departmentId || shift.department_id);
  for (const mgr of deptAdmins) {
    await createNotification({
      userId: mgr.id,
      organizationId,
      type: 'swap_posted',
      title: 'Swap Posted — Department',
      message: `${requester.full_name} posted "${shift.title}" for swap. Check details to approve or manage.`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (mgr.email) {
      await sendSwapPostedAdminEmail(
        mgr.email,
        mgr.full_name || 'Admin',
        requester.full_name || 'Worker',
        shift.title,
        dateStr,
        reason,
      );
    }
  }

  // Get workers in the same department
  const { data: departmentWorkers } = await admin
    .from('profiles')
    .select('id, email, full_name, department_id')
    .eq('organization_id', organizationId)
    .eq('user_role', 'worker');

  if (!departmentWorkers || departmentWorkers.length === 0) return;

  // (dateStr already declared above — reuse it for worker notifications)

  // Notify only workers in the same department
  for (const worker of departmentWorkers) {
    if (worker.id === requesterUserId) continue; // Don't notify requester
    
    // Check if worker is in the department
    if (worker.department_id !== departmentId && worker.department_id !== shift.department_id) continue;

    await createNotification({
      userId: worker.id,
      organizationId,
      type: 'swap_posted',
      title: 'Shift Available for Swap',
      message: `${requester.full_name} posted "${shift.title}" for swap on ${dateStr}. Offer to cover it if interested!`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    // Send email if notifications enabled
    if (await shouldSendNotification(worker.id, 'email', 'swap_posted')) {
      if (worker.email) {
        await sendSwapPostedEmail(
          worker.email,
          worker.full_name || 'Worker',
          requester.full_name || 'A worker',
          shift.title,
          dateStr,
          reason,
        );
      }
    }
  }
}

/**
 * Shift completed (notify admins and managers)
 */
export async function triggerShiftCompletedNotification(
  shiftId: string,
  workerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  // Fetch shift and worker details
  const { data: shift } = await admin
    .from('shifts')
    .select('title, department_id')
    .eq('id', shiftId)
    .single();

  const { data: worker } = await admin
    .from('profiles')
    .select('full_name, email')
    .eq('id', workerId)
    .single();

  if (!shift || !worker) return;

  // Get all admins
  const { data: admins } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('organization_id', organizationId)
    .eq('user_role', 'org_admin');

  // Get department managers (if shift has a department)
  let managers: any[] = [];
  if (shift.department_id) {
    const { data: deptManagers } = await admin
      .from('profiles')
      .select('id, email, full_name')
      .eq('organization_id', organizationId)
      .eq('user_role', 'manager')
      .or(`manager_type.eq.general,and(manager_type.eq.department,department_id.eq.${shift.department_id})`);

    managers = deptManagers || [];
  }

  const recipients = [...(admins || []), ...managers];
  const uniqueRecipients = Array.from(
    new Map(recipients.map((r) => [r.id, r])).values()
  );

  // Notify each admin/manager
  for (const recipient of uniqueRecipients) {
    await createNotification({
      userId: recipient.id,
      organizationId,
      type: 'shift_completion_pending',
      title: 'Shift Completion Awaiting Review',
      message: `${worker.full_name} marked "${shift.title}" as complete. Please review and approve.`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });

    // Send email if notifications enabled
    if (await shouldSendNotification(recipient.id, 'email', 'shift_completion_pending')) {
      if (recipient.email) {
        await sendShiftCompletedEmail(
          recipient.email,
          recipient.full_name || recipient.id === admins?.[0]?.id ? 'Admin' : 'Manager',
          worker.full_name || 'A worker',
          shift.title,
          admins?.some((a: any) => a.id === recipient.id) ? 'org_admin' : 'manager',
        );
      }
    }
  }
}

/**
 * Shift claim approved (notify worker)
 */
export async function triggerShiftApprovedNotification(
  shiftId: string,
  workerId: string,
  organizationId: string,
) {
  const admin = createAdminClient();

  // Fetch shift details
  const { data: shift } = await admin
    .from('shifts')
    .select('title, start_time, end_time')
    .eq('id', shiftId)
    .single();

  const { data: worker } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', workerId)
    .single();

  if (!shift || !worker) return;

  const startDate = new Date(shift.start_time);
  const endDate = new Date(shift.end_time);
  const dateStr = startDate.toLocaleDateString();
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  if (await shouldSendNotification(workerId, 'email', 'shift_claim_approved')) {
    await createNotification({
      userId: workerId,
      organizationId,
      type: 'shift_claim_approved',
      title: 'Shift Claim Approved ✅',
      message: `Your claim for "${shift.title}" on ${dateStr} has been approved!`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });

    if (worker.email) {
      await sendShiftAssignedEmail(
        worker.email,
        worker.full_name || 'Worker',
        shift.title,
        dateStr,
        timeStr,
        undefined,
        'Your shift claim has been approved. See you then!',
      );
    }
  }
}
