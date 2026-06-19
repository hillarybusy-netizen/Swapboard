import React from 'react';
import { EmailLayout } from './EmailLayout';

interface SwapRejectedProps {
  workerName: string;
  shiftTitle: string;
  managerName: string;
  managerNotes?: string;
  dashboardUrl: string;
  canReswap: boolean;
}

export function SwapRejectedEmail({
  workerName,
  shiftTitle,
  managerName,
  managerNotes,
  dashboardUrl,
  canReswap,
}: SwapRejectedProps) {
  return (
    <EmailLayout
      title="Swap Request Declined"
      actionUrl={dashboardUrl}
      actionText="View in SwapBoard"
    >
      <p>Hi {workerName},</p>

      <p>
        Your manager <strong>{managerName}</strong> has declined your swap request for the shift <strong>{shiftTitle}</strong>.
      </p>

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

      {canReswap ? (
        <div className="warning-box">
          <p style={{ margin: 0 }}>
            You can try posting this shift for swap again. Log in to SwapBoard to repost it.
          </p>
        </div>
      ) : (
        <div className="warning-box">
          <p style={{ margin: 0 }}>
            This shift has been locked and cannot be posted for swap again. Please contact your manager for more information.
          </p>
        </div>
      )}

      <p>
        If you have any questions about this decision, please reach out to your manager directly.
        <br />
        <span className="meta">Need help? Log in to SwapBoard</span>
      </p>
    </EmailLayout>
  );
}
