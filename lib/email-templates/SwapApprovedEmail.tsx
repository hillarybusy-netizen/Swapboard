import React from 'react';
import { EmailLayout } from './EmailLayout';

interface SwapApprovedProps {
  workerName: string;
  requesterName: string;
  shiftTitle: string;
  managerName: string;
  managerNotes?: string;
  dashboardUrl: string;
}

export function SwapApprovedEmail({
  workerName,
  requesterName,
  shiftTitle,
  managerName,
  managerNotes,
  dashboardUrl,
}: SwapApprovedProps) {
  return (
    <EmailLayout
      title="Swap Approved ✅"
      actionUrl={dashboardUrl}
      actionText="View in SwapBoard"
    >
      <p>Hi {workerName},</p>

      <p>Great news! Your manager <strong>{managerName}</strong> has approved the shift swap.</p>

      <div className="success-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Swapping with:</strong> {requesterName}
        </p>
      </div>

      {managerNotes && (
        <>
          <p>
            <strong>Manager's Note:</strong>
          </p>
          <div className="info-box">
            <p style={{ margin: 0, fontStyle: 'italic' }}>{managerNotes}</p>
          </div>
        </>
      )}

      <p>
        The shift has been transferred to your account. You can view all your shifts in the SwapBoard dashboard.
      </p>

      <p>
        Thank you for using SwapBoard!
        <br />
        <span className="meta">Questions? Contact your manager</span>
      </p>
    </EmailLayout>
  );
}
