import React from 'react';
import { EmailLayout, InfoBox, WarningBox, DetailTable, DetailRow, Divider } from './EmailLayout';

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
      title="New Shift Assigned 📋"
      previewText={`You have a new shift: ${shiftTitle} on ${shiftDate}.`}
      actionUrl={dashboardUrl}
      actionText="View Shift Details"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        You've been assigned a new shift. Here are the details — please add it to your calendar
        and mark your attendance when the shift begins.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Time" value={shiftTime} />
          {departmentName ? <DetailRow label="Department" value={departmentName} /> : <></>}
        </DetailTable>
      </InfoBox>

      {notes && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Special instructions
          </p>
          <WarningBox>
            <p style={{ margin: 0 }}>{notes}</p>
          </WarningBox>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Need to swap this shift? You can post it for swap directly from your SwapBoard dashboard.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
