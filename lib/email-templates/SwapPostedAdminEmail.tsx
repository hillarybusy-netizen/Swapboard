import React from 'react';
import { EmailLayout } from './EmailLayout';

interface SwapPostedAdminProps {
  adminName: string;
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  reason?: string;
  dashboardUrl: string;
}

export function SwapPostedAdminEmail({
  adminName,
  workerName,
  shiftTitle,
  shiftDate,
  reason,
  dashboardUrl,
}: SwapPostedAdminProps) {
  return (
    <EmailLayout
      title="Shift Posted for Swap"
      actionUrl={dashboardUrl}
      actionText="View Admin Dashboard"
    >
      <p>Hi {adminName},</p>

      <p>{workerName} has posted their shift up for swap. Other workers in the department have been notified and can offer to cover it.</p>

      <div className="info-box">
        <p style={{ margin: 0 }}>
          <strong>Worker:</strong> {workerName}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Date:</strong> {shiftDate}
        </p>
      </div>

      {reason && (
        <>
          <p>
            <strong>Reason for Swap:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0 }}>{reason}</p>
          </div>
        </>
      )}

      <p>
        No action is required from you at this time. Once another worker offers to cover the shift, the manager will be prompted to approve the swap.
      </p>

      <p>
        Thanks,
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
