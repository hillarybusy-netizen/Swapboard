import React from 'react';
import { EmailLayout, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface SwapPostedAdminProps {
  adminName: string;
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  reason?: string;
  dashboardUrl: string;
}

export function SwapPostedAdminEmail({
  adminName,
  workerName,
  shiftTitle,
  shiftDate,
  reason,
  dashboardUrl,
}: SwapPostedAdminProps) {
  return (
    <EmailLayout
      title="Shift Posted for Swap — FYI"
      previewText={`${workerName} posted ${shiftTitle} for swap.`}
      actionUrl={dashboardUrl}
      actionText="View in Dashboard"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{adminName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        A worker in your organisation has posted a shift for swap. Department colleagues have
        been notified. No action is required from you unless a cover offer needs approval.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Posted by" value={workerName} />
        </DetailTable>
      </InfoBox>

      {reason && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Reason for swap
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: '#374151', fontStyle: 'italic' }}>
            &quot;{reason}&quot;
          </p>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        You&apos;ll receive another notification when a worker offers to cover this shift and approval is needed.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
