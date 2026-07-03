import React from 'react';
import { EmailLayout, WarningBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface ShiftCompletedProps {
  recipientName: string;
  workerName: string;
  shiftTitle: string;
  recipientRole: 'org_admin' | 'manager';
  dashboardUrl: string;
}

export function ShiftCompletedEmail({
  recipientName,
  workerName,
  shiftTitle,
  recipientRole,
  dashboardUrl,
}: ShiftCompletedProps) {
  return (
    <EmailLayout
      title="Shift Completion Needs Review"
      previewText={`${workerName} marked ${shiftTitle} as complete — your review is needed.`}
      accentColor="#F59E0B"
      actionUrl={dashboardUrl}
      actionText="Review Completion"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{recipientName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        <strong>{workerName}</strong> has marked a shift as complete and is awaiting your review.
        Please approve, reject, or flag it as a no-show.
      </p>

      <WarningBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Completed by" value={workerName} />
          <DetailRow label="Status" value="Pending your approval" />
          <DetailRow
            label="Your role"
            value={recipientRole === 'org_admin' ? 'Administrator' : 'Manager'}
          />
        </DetailTable>
      </WarningBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Please review this completion promptly so the worker's record stays up to date.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
