import React from 'react';
import { EmailLayout } from './EmailLayout';

interface GeneralShiftAvailableProps {
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  shiftTime: string;
  departmentName?: string;
  notes?: string;
  dashboardUrl: string;
}

export function GeneralShiftAvailableEmail({
  workerName,
  shiftTitle,
  shiftDate,
  shiftTime,
  departmentName,
  notes,
  dashboardUrl,
}: GeneralShiftAvailableProps) {
  return (
    <EmailLayout
      title="General Shift Available"
      actionUrl={dashboardUrl}
      actionText="View Available Shifts"
    >
      <p>Hi {workerName},</p>

      <p>A new shift has been posted and is available for claiming in SwapBoard!</p>

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
            <strong>Shift Details:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0 }}>{notes}</p>
          </div>
        </>
      )}

      <p>
        If you're interested in this shift, head to your SwapBoard dashboard to claim it. First come, first served!
      </p>

      <p>
        Good luck!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
