import React from 'react';
import { EmailLayout, DangerBox, InfoBox, WarningBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface SwapRejectedProps {
  workerName: string;
  shiftTitle: string;
  managerName: string;
  managerNotes?: string;
  dashboardUrl: string;
  canReswap: boolean;
}

export function SwapRejectedEmail({
  workerName,
  shiftTitle,
  managerName,
  managerNotes,
  dashboardUrl,
  canReswap,
}: SwapRejectedProps) {
  return (
    <EmailLayout
      title="Swap Request Declined"
      previewText={`Your swap request for ${shiftTitle} was not approved.`}
      accentColor="#EF4444"
      actionUrl={dashboardUrl}
      actionText="View My Shifts"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Unfortunately, <strong>{managerName}</strong> has declined your swap request for the
        shift below.
      </p>

      <DangerBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Declined by" value={managerName} />
        </DetailTable>
      </DangerBox>

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

      {canReswap ? (
        <WarningBox>
          <p style={{ margin: 0, fontWeight: 600 }}>You can try again</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            This shift can be reposted for swap. Log in to SwapBoard to try again.
          </p>
        </WarningBox>
      ) : (
        <DangerBox>
          <p style={{ margin: 0, fontWeight: 600 }}>Shift locked for swapping</p>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>
            This shift cannot be posted for swap again. Please speak to your manager directly
            if you need further assistance.
          </p>
        </DangerBox>
      )}

      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
