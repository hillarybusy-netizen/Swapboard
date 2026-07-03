import React from 'react';
import { EmailLayout, SuccessBox, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

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
      title="Swap Approved — Summary ✅"
      previewText={`${managerName} approved a swap for ${shiftTitle}.`}
      accentColor="#22C55E"
      actionUrl={dashboardUrl}
      actionText="View Admin Dashboard"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{adminName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        <strong>{managerName}</strong> has approved a shift swap. The schedule has been updated
        automatically — no further action is required.
      </p>

      <SuccessBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Originally assigned to" value={originalWorkerName} />
          <DetailRow label="Now assigned to" value={coverWorkerName} />
          <DetailRow label="Approved by" value={managerName} />
        </DetailTable>
      </SuccessBox>

      {managerNotes && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Manager's note
          </p>
          <InfoBox>
            <p style={{ margin: 0, fontStyle: 'italic' }}>{managerNotes}</p>
          </InfoBox>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Both workers have been notified. You can view all swap activity in your admin dashboard.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
