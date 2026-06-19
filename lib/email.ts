import { Resend } from 'resend';
import * as React from 'react';
import { SwapApprovedEmail } from './email-templates/SwapApprovedEmail';
import { SwapRejectedEmail } from './email-templates/SwapRejectedEmail';
import { ShiftAssignedEmail } from './email-templates/ShiftAssignedEmail';
import { PendingApprovalEmail } from './email-templates/PendingApprovalEmail';
import { DigestEmail } from './email-templates/DigestEmail';

const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || 'noreply@swapboard.ca';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.swapboard.ca';

// Lazy-load Resend client
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

// Generic email sending function
async function sendEmail(
  to: string,
  subject: string,
  component: React.ReactElement,
) {
  const resend = getResendClient();

  if (!resend) {
    // Fallback to logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n📧 EMAIL (${subject})`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`================================================\n`);
    }
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react: component,
    });

    if (result.error) {
      console.error(`[Email Error] Failed to send to ${to}:`, result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error(`[Email Error] Exception sending to ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Swap notification emails
export async function sendSwapApprovedEmail(
  to: string,
  workerName: string,
  requesterName: string,
  shiftTitle: string,
  managerName: string,
  managerNotes?: string,
) {
  const dashboardUrl = `${APP_URL}/swaps`;

  return sendEmail(
    to,
    '✅ Your Swap Has Been Approved',
    React.createElement(SwapApprovedEmail, {
      workerName,
      requesterName,
      shiftTitle,
      managerName,
      managerNotes,
      dashboardUrl,
    }),
  );
}

export async function sendSwapRejectedEmail(
  to: string,
  workerName: string,
  shiftTitle: string,
  managerName: string,
  managerNotes?: string,
  canReswap: boolean = true,
) {
  const dashboardUrl = `${APP_URL}/swaps`;

  return sendEmail(
    to,
    '❌ Your Swap Request Was Declined',
    React.createElement(SwapRejectedEmail, {
      workerName,
      shiftTitle,
      managerName,
      managerNotes,
      dashboardUrl,
      canReswap,
    }),
  );
}

// Shift notification emails
export async function sendShiftAssignedEmail(
  to: string,
  workerName: string,
  shiftTitle: string,
  shiftDate: string,
  shiftTime: string,
  departmentName?: string,
  notes?: string,
) {
  const dashboardUrl = `${APP_URL}/my-shifts`;

  return sendEmail(
    to,
    '📋 New Shift Assigned to You',
    React.createElement(ShiftAssignedEmail, {
      workerName,
      shiftTitle,
      shiftDate,
      shiftTime,
      departmentName,
      notes,
      dashboardUrl,
    }),
  );
}

export async function sendShiftDoneReminderEmail(
  to: string,
  workerName: string,
  shiftTitle: string,
) {
  const dashboardUrl = `${APP_URL}/my-shifts`;

  return sendEmail(
    to,
    '⏰ Mark Your Shift as Done',
    React.createElement(ShiftAssignedEmail, {
      workerName,
      shiftTitle,
      shiftDate: 'Today',
      shiftTime: 'Recently ended',
      notes: 'Please mark this shift as done in SwapBoard so your manager can approve your completion.',
      dashboardUrl,
    }),
  );
}

// Manager notification emails
export async function sendPendingApprovalEmail(
  to: string,
  managerName: string,
  requesterName: string,
  coverWorkerName: string,
  shiftTitle: string,
  reason?: string,
) {
  const dashboardUrl = `${APP_URL}/swaps?status=worker_accepted`;

  return sendEmail(
    to,
    '⏳ Swap Request Awaiting Your Approval',
    React.createElement(PendingApprovalEmail, {
      managerName,
      requesterName,
      coverWorkerName,
      shiftTitle,
      reason,
      dashboardUrl,
    }),
  );
}

// Digest emails
interface DigestItem {
  title: string;
  description: string;
  count?: number;
}

export async function sendDigestEmail(
  to: string,
  userName: string,
  userRole: 'worker' | 'manager' | 'admin',
  items: {
    pending_approvals?: DigestItem[];
    assigned_shifts?: DigestItem[];
    swap_updates?: DigestItem[];
    overdue_items?: DigestItem[];
  },
) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  return sendEmail(
    to,
    `📊 Your Daily ${userRole === 'manager' ? 'Management' : 'Work'} Summary`,
    React.createElement(DigestEmail, {
      userName,
      userRole,
      items,
      dashboardUrl,
    }),
  );
}

// Test email function
export async function sendTestEmail(to: string, userName: string) {
  return sendEmail(
    to,
    '🧪 SwapBoard Test Email',
    React.createElement(ShiftAssignedEmail, {
      workerName: userName,
      shiftTitle: 'Test Shift',
      shiftDate: new Date().toLocaleDateString(),
      shiftTime: '9:00 AM - 5:00 PM',
      departmentName: 'Test Department',
      notes: 'This is a test notification from SwapBoard. If you received this, email delivery is working correctly!',
      dashboardUrl: `${APP_URL}/my-shifts`,
    }),
  );
}
