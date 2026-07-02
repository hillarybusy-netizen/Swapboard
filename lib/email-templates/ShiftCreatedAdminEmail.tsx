import React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShiftCreatedAdminProps {
  adminName: string;
  workerName: string;
  creatorName: string;
  shiftTitle: string;
  shiftDate: string;
  shiftTime: string;
  departmentName?: string;
  notes?: string;
  dashboardUrl: string;
}

export function ShiftCreatedAdminEmail({
  adminName,
  workerName,
  creatorName,
  shiftTitle,
  shiftDate,
  shiftTime,
  departmentName,
  notes,
  dashboardUrl,
}: ShiftCreatedAdminProps) {
  return (
    <EmailLayout
      title="New Shift Assigned"
      actionUrl={dashboardUrl}
      actionText="View Dashboard"
    >
      <p>Hi {adminName},</p>

      <p>
        A new shift has been created and assigned to <strong>{workerName}</strong> by <strong>{creatorName}</strong>. Here are the details:
      </p>

      <div className="info-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Date & Time:</strong> {shiftDate} at {shiftTime}
        </p>
        {departmentName && (
          <p style={{ margin: '10px 0 0 0' }}>
            <strong>Department:</strong> {departmentName}
          </p>
        )}
      </div>

      {notes && (
        <>
          <p>
            <strong>Notes:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0 }}>{notes}</p>
          </div>
        </>
      )}

      <p>
        <span className="meta">SwapBoard Notification System</span>
      </p>
    </EmailLayout>
  );
}
