import React from 'react';
import { EmailLayout, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface SwapOfferProps {
  shiftOwnerName: string;
  offeringWorkerName: string;
  shiftTitle: string;
  dashboardUrl: string;
}

export function SwapOfferEmail({
  shiftOwnerName,
  offeringWorkerName,
  shiftTitle,
  dashboardUrl,
}: SwapOfferProps) {
  return (
    <EmailLayout
      title="Someone Wants to Cover Your Shift ✋"
      previewText={`${offeringWorkerName} has offered to cover ${shiftTitle}.`}
      actionUrl={dashboardUrl}
      actionText="View Swap Details"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{shiftOwnerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Good news — <strong>{offeringWorkerName}</strong> has offered to cover your shift. Your
        manager will now review and approve or decline the swap.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Cover offered by" value={offeringWorkerName} />
          <DetailRow label="Status" value="Pending manager approval" />
        </DetailTable>
      </InfoBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        You'll receive another email once your manager makes a decision. In the meantime, assume
        you still hold this shift until confirmed otherwise.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
