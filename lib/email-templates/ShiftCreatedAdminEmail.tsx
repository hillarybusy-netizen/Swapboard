import React from 'react';
import { EmailLayout, InfoBox, WarningBox, DetailTable, DetailRow, Divider } from './EmailLayout';

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
      title="Shift Created — Admin Summary"
      previewText={`${creatorName} assigned ${shiftTitle} to ${workerName}.`}
      actionUrl={dashboardUrl}
      actionText="View Dashboard"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{adminName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        A new shift has been created and assigned to <strong>{workerName}</strong> by{' '}
        <strong>{creatorName}</strong>.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Time" value={shiftTime} />
          {departmentName ? <DetailRow label="Department" value={departmentName} /> : <></>}
          <DetailRow label="Assigned to" value={workerName} />
          <DetailRow label="Created by" value={creatorName} />
        </DetailTable>
      </InfoBox>

      {notes && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Shift notes
          </p>
          <WarningBox>
            <p style={{ margin: 0 }}>{notes}</p>
          </WarningBox>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        {workerName} has been notified. You can manage all shifts from your admin dashboard.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
