import React from 'react';
import { EmailLayout } from './EmailLayout';

interface SwapApprovedAdminProps {
  adminName: string;
  managerName: string;
  originalWorkerName: string;
  coverWorkerName: string;
  shiftTitle: string;
  shiftDate: string;
  managerNotes?: string;
  dashboardUrl: string;
}

export function SwapApprovedAdminEmail({
  adminName,
  managerName,
  originalWorkerName,
  coverWorkerName,
  shiftTitle,
  shiftDate,
  managerNotes,
  dashboardUrl,
}: SwapApprovedAdminProps) {
  return (
    <EmailLayout
      title="Shift Swap Approved"
      actionUrl={dashboardUrl}
      actionText="View Admin Dashboard"
    >
      <p>Hi {adminName},</p>

      <p><strong>{managerName}</strong> has approved a shift swap. The shift has been reassigned accordingly.</p>

      <div className="info-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Date:</strong> {shiftDate}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Originally Assigned To:</strong> {originalWorkerName}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Now Assigned To:</strong> {coverWorkerName}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Approved By:</strong> {managerName}
        </p>
      </div>

      {managerNotes && (
        <>
          <p>
            <strong>Manager Notes:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0 }}>{managerNotes}</p>
          </div>
        </>
      )}

      <p>
        Both workers have been notified of this decision. No further action is required.
      </p>

      <p>
        Thanks,
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
