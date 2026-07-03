import React from 'react';
import { EmailLayout, SuccessBox, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface SwapApprovedProps {
  workerName: string;
  requesterName: string;
  shiftTitle: string;
  managerName: string;
  managerNotes?: string;
  dashboardUrl: string;
}

export function SwapApprovedEmail({
  workerName,
  requesterName,
  shiftTitle,
  managerName,
  managerNotes,
  dashboardUrl,
}: SwapApprovedProps) {
  return (
    <EmailLayout
      title="Swap Approved ✅"
      previewText={`Great news! Your shift swap for ${shiftTitle} has been approved.`}
      accentColor="#22C55E"
      actionUrl={dashboardUrl}
      actionText="View My Shifts"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Great news — <strong>{managerName}</strong> has approved your shift swap. The shift has
        been officially transferred.
      </p>

      <SuccessBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Swapping with" value={requesterName} />
          <DetailRow label="Approved by" value={managerName} />
        </DetailTable>
      </SuccessBox>

      {managerNotes && (
        <>
          <Divider />
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Manager's note
          </p>
          <InfoBox>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#1E40AF' }}>{managerNotes}</p>
          </InfoBox>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Your shift schedule has been updated. You can view all your upcoming shifts in your dashboard.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
