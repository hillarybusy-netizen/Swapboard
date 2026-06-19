import React from 'react';
import { EmailLayout } from './EmailLayout';

interface PendingApprovalProps {
  managerName: string;
  requesterName: string;
  coverWorkerName: string;
  shiftTitle: string;
  reason?: string;
  dashboardUrl: string;
}

export function PendingApprovalEmail({
  managerName,
  requesterName,
  coverWorkerName,
  shiftTitle,
  reason,
  dashboardUrl,
}: PendingApprovalProps) {
  return (
    <EmailLayout
      title="Swap Request Awaiting Your Approval"
      actionUrl={dashboardUrl}
      actionText="Review & Approve"
    >
      <p>Hi {managerName},</p>

      <p>A shift swap request requires your approval:</p>

      <div className="info-box">
        <p style={{ margin: 0 }}>
          <strong>{requesterName}</strong> wants to swap
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>With {coverWorkerName}</strong> covering the shift
        </p>
      </div>

      {reason && (
        <>
          <p>
            <strong>Reason:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0, fontStyle: 'italic' }}>{reason}</p>
          </div>
        </>
      )}

      <p>Please log in to SwapBoard to review and approve or reject this request.</p>

      <p>
        Thanks!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
