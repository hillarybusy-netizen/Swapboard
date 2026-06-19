import React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShiftAssignedProps {
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  shiftTime: string;
  departmentName?: string;
  notes?: string;
  dashboardUrl: string;
}

export function ShiftAssignedEmail({
  workerName,
  shiftTitle,
  shiftDate,
  shiftTime,
  departmentName,
  notes,
  dashboardUrl,
}: ShiftAssignedProps) {
  return (
    <EmailLayout
      title="New Shift Assigned"
      actionUrl={dashboardUrl}
      actionText="View Shift Details"
    >
      <p>Hi {workerName},</p>

      <p>You have been assigned a new shift in SwapBoard. Here are the details:</p>

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
            <strong>Special Instructions:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0 }}>{notes}</p>
          </div>
        </>
      )}

      <p>
        Please make sure to mark your attendance when the shift begins. If you need to swap this shift or have any questions, visit your SwapBoard dashboard.
      </p>

      <p>
        See you soon!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
