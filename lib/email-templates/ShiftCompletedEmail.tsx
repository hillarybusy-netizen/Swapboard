import React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShiftCompletedProps {
  recipientName: string;
  workerName: string;
  shiftTitle: string;
  recipientRole: 'org_admin' | 'manager';
  dashboardUrl: string;
}

export function ShiftCompletedEmail({
  recipientName,
  workerName,
  shiftTitle,
  recipientRole,
  dashboardUrl,
}: ShiftCompletedProps) {
  const roleLabel = recipientRole === 'org_admin' ? 'Administrator' : 'Manager';

  return (
    <EmailLayout
      title="Shift Completion Notification"
      actionUrl={dashboardUrl}
      actionText={`Review Shift Completion`}
    >
      <p>Hi {recipientName},</p>

      <p>{workerName} has marked the following shift as complete and is awaiting {recipientRole === 'org_admin' ? 'org_admin' : 'manager'} review:</p>

      <div className="success-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Completed By:</strong> {workerName}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Status:</strong> Pending your approval
        </p>
      </div>

      <p>
        Please review the shift completion in your SwapBoard dashboard. You can approve, reject, or mark it as no-show based on your records.
      </p>

      <p>
        Thank you for keeping SwapBoard up to date!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
