"use server";

import { createNotification, type NotificationType } from "./notifications";
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

  // Check if channel is enabled globally
  if (channel === 'email' && !prefs.email?.immediate) return false;
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
    .select('title')
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

  // No email for this - it's internal
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
    .select('title')
    .eq('id', swap?.shift_id)
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

  // Notify requester
  await createNotification({
    userId: requesterUserId,
    organizationId,
    type: 'cover_offered',
    title: 'Cover Offered',
    message: `${coverWorker?.full_name || 'A worker'} has offered to cover "${shiftTitle}". Your manager will review this soon.`,
    relatedEntityType: 'swap_request',
    relatedEntityId: swapId,
  });

  // Notify manager - awaiting approval
  if (shouldSendNotification(managerId, 'email', 'swap_approval_pending')) {
    await createNotification({
      userId: managerId,
      organizationId,
      type: 'swap_approval_pending',
      title: 'Swap Request Pending Approval',
      message: `${coverWorker?.full_name || 'A worker'} has offered to cover "${shiftTitle}". This swap is pending your approval.`,
      relatedEntityType: 'swap_request',
      relatedEntityId: swapId,
    });

    if (manager?.email) {
      await sendPendingApprovalEmail(
        manager.email,
        manager.full_name || 'Manager',
        coverWorker?.full_name || 'A worker',
        coverWorker?.full_name || 'A worker',
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

  // Fetch required data
  const { data: shift } = await admin
    .from('shifts')
    .select('title')
    .eq('id', (await admin.from('swap_requests').select('shift_id').eq('id', swapId).single()).data?.shift_id)
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

  // Notify requester
  if (shouldSendNotification(requesterUserId, 'email', 'swap_approved')) {
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
  if (shouldSendNotification(coverWorkerId, 'email', 'swap_approved')) {
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

  if (shouldSendNotification(requesterUserId, 'email', 'swap_rejected')) {
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
    .select('title, start_time, end_time, notes, department_id')
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

  if (shouldSendNotification(workerId, 'email', 'shift_assigned')) {
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

  if (shouldSendNotification(workerId, 'email', 'shift_starting_soon')) {
    await createNotification({
      userId: workerId,
      organizationId,
      type: 'shift_starting_soon',
      title: '⏰ Shift Starting Soon',
      message: `Reminder: "${shift.title}" starts at ${timeStr}. See you soon!`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });
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

  // Notify worker
  if (shouldSendNotification(assignedToId, 'in_app', 'shift_overdue')) {
    await createNotification({
      userId: assignedToId,
      organizationId,
      type: 'shift_overdue',
      title: '⚠️ Shift Overdue',
      message: `Your shift "${shift.title}" ended ${new Date(shift.end_time).toLocaleTimeString()}. Please mark it as done.`,
      relatedEntityType: 'shift',
      relatedEntityId: shiftId,
    });
  }

  // Notify manager
  if (shouldSendNotification(managerId, 'in_app', 'shift_overdue')) {
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

  if (shouldSendNotification(managerId, 'in_app', 'shift_completion_pending')) {
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

  if (shouldSendNotification(workerId, 'in_app', 'completion_approved')) {
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
}

// ============================================================================
// GENERAL SHIFT & SWAP POSTED NOTIFICATIONS
// ============================================================================

/**
 * General shift posted (unassigned shift for all workers to claim)
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

  // Get all workers in organization
  const { data: workers } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('organization_id', organizationId)
    .eq('user_role', 'worker');

  if (!workers || workers.length === 0) return;

  const startDate = new Date(shift.start_time);
  const endDate = new Date(shift.end_time);
  const dateStr = startDate.toLocaleDateString();
  const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
    if (shouldSendNotification(worker.id, 'email', 'shift_assigned')) {
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
 * Shift posted for swap (notify department workers)
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
    .select('title, start_time')
    .eq('id', shiftId)
    .single();

  const { data: requester } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', requesterUserId)
    .single();

  if (!shift || !requester) return;

  // Get all workers in department (excluding requester)
  const { data: workers } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .eq('organization_id', organizationId)
    .eq('user_role', 'worker');

  if (!workers || workers.length === 0) return;

  const startDate = new Date(shift.start_time);
  const dateStr = startDate.toLocaleDateString();

  // Filter to department workers (if department_ids contains this department)
  for (const worker of workers) {
    if (worker.id === requesterUserId) continue; // Don't notify requester

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
    if (shouldSendNotification(worker.id, 'email', 'swap_posted')) {
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
    .eq('user_role', 'admin');

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
    if (shouldSendNotification(recipient.id, 'email', 'shift_completion_pending')) {
      if (recipient.email) {
        await sendShiftCompletedEmail(
          recipient.email,
          recipient.full_name || recipient.id === admins?.[0]?.id ? 'Admin' : 'Manager',
          worker.full_name || 'A worker',
          shift.title,
          admins?.some((a: any) => a.id === recipient.id) ? 'admin' : 'manager',
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

  if (shouldSendNotification(workerId, 'email', 'shift_claim_approved')) {
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
