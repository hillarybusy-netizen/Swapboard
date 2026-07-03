import React from 'react';
import { EmailLayout, WarningBox, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface PendingApprovalProps {
  managerName: string;
  requesterName: string;
  coverWorkerName: string;
  shiftTitle: string;
  reason?: string;
  dashboardUrl: string;
}

export function PendingApprovalEmail({
  managerName,
  requesterName,
  coverWorkerName,
  shiftTitle,
  reason,
  dashboardUrl,
}: PendingApprovalProps) {
  return (
    <EmailLayout
      title="Swap Awaiting Your Approval ⏳"
      previewText={`${coverWorkerName} has offered to cover ${requesterName}'s shift — action needed.`}
      accentColor="#F59E0B"
      actionUrl={dashboardUrl}
      actionText="Review & Approve"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{managerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        A shift swap in your team requires your approval. Please review the details below and
        approve or decline from your SwapBoard dashboard.
      </p>

      <WarningBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Originally assigned to" value={requesterName} />
          <DetailRow label="Cover offered by" value={coverWorkerName} />
          <DetailRow label="Status" value="Awaiting your decision" />
        </DetailTable>
      </WarningBox>

      {reason && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Reason for swap request
          </p>
          <InfoBox>
            <p style={{ margin: 0, fontStyle: 'italic' }}>{reason}</p>
          </InfoBox>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Both workers will be notified automatically once you make a decision. This swap cannot
        proceed without your approval.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
