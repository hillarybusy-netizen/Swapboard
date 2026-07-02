import React from 'react';
import { EmailLayout } from './EmailLayout';

interface SwapPostedConfirmationProps {
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  dashboardUrl: string;
}

export function SwapPostedConfirmationEmail({
  workerName,
  shiftTitle,
  shiftDate,
  dashboardUrl,
}: SwapPostedConfirmationProps) {
  return (
    <EmailLayout
      title="Shift Posted for Swap"
      actionUrl={dashboardUrl}
      actionText="View Your Swaps"
    >
      <p>Hi {workerName},</p>

      <p>You have successfully posted your shift up for swap. Your coworkers in your department have been notified.</p>

      <div className="info-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Date:</strong> {shiftDate}
        </p>
      </div>

      <p>
        We will notify you by email as soon as someone offers to cover it. Until it is covered and approved by your manager, you are still responsible for this shift.
      </p>

      <p>
        Thanks,
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
