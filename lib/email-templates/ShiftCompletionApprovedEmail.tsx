import React from 'react';
import { EmailLayout, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface ShiftCompletionApprovedProps {
  workerName: string;
  shiftTitle: string;
  managerName: string;
  dashboardUrl: string;
}

export function ShiftCompletionApprovedEmail({
  workerName,
  shiftTitle,
  managerName,
  dashboardUrl,
}: ShiftCompletionApprovedProps) {
  return (
    <EmailLayout
      title="Shift Completion Approved ✅"
      previewText={`Your completion for "${shiftTitle}" has been approved by ${managerName}.`}
      accentColor="#10B981"
      actionUrl={dashboardUrl}
      actionText="View My Shifts"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Great work! Your shift completion has been reviewed and approved. Your attendance record
        has been updated accordingly.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Approved by" value={managerName} />
          <DetailRow label="Status" value="Approved ✅" />
        </DetailTable>
      </InfoBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Keep up the great work. See you at your next shift!
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
