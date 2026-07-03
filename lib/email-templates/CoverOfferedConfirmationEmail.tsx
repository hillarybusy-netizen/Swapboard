import React from 'react';
import { EmailLayout, SuccessBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface CoverOfferedConfirmationProps {
  coverWorkerName: string;
  originalWorkerName: string;
  shiftTitle: string;
  shiftDate: string;
  dashboardUrl: string;
}

export function CoverOfferedConfirmationEmail({
  coverWorkerName,
  originalWorkerName,
  shiftTitle,
  shiftDate,
  dashboardUrl,
}: CoverOfferedConfirmationProps) {
  return (
    <EmailLayout
      title="Cover Offer Submitted ✅"
      previewText={`Your offer to cover ${shiftTitle} has been sent for manager approval.`}
      accentColor="#22C55E"
      actionUrl={dashboardUrl}
      actionText="View My Shifts"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{coverWorkerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Your offer to cover the shift from <strong>{originalWorkerName}</strong> has been
        submitted and is now pending manager approval.
      </p>

      <SuccessBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Original worker" value={originalWorkerName} />
          <DetailRow label="Status" value="Pending manager approval" />
        </DetailTable>
      </SuccessBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        <strong>Important:</strong> Do not assume this shift is yours until you receive a
        confirmation email. You'll be notified as soon as your manager makes a decision.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
