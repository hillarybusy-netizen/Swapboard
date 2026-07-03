import React from 'react';
import { EmailLayout, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface SwapPostedConfirmationProps {
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  dashboardUrl: string;
}

export function SwapPostedConfirmationEmail({
  workerName,
  shiftTitle,
  shiftDate,
  dashboardUrl,
}: SwapPostedConfirmationProps) {
  return (
    <EmailLayout
      title="Your Shift Is Posted for Swap 🔄"
      previewText={`${shiftTitle} on ${shiftDate} is now visible to your team.`}
      actionUrl={dashboardUrl}
      actionText="View My Swaps"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Your shift has been successfully posted for swap. Colleagues in your department will be
        notified and can offer to cover it.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Status" value="Awaiting cover offer" />
        </DetailTable>
      </InfoBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        You'll receive a notification as soon as someone offers to cover your shift. Your manager
        will then review and approve the swap.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
