import React from 'react';
import { EmailLayout, WarningBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface ShiftOverdueProps {
  recipientName: string;
  shiftTitle: string;
  endedAt: string;
  recipientRole: 'worker' | 'manager' | 'org_admin';
  dashboardUrl: string;
}

export function ShiftOverdueEmail({
  recipientName,
  shiftTitle,
  endedAt,
  recipientRole,
  dashboardUrl,
}: ShiftOverdueProps) {
  const isWorker = recipientRole === 'worker';

  return (
    <EmailLayout
      title={isWorker ? 'Your Shift Is Overdue ⚠️' : 'Shift Overdue — Action Required ⚠️'}
      previewText={
        isWorker
          ? `Please mark "${shiftTitle}" as done in SwapBoard.`
          : `"${shiftTitle}" ended at ${endedAt} and has not been marked complete.`
      }
      accentColor="#F59E0B"
      actionUrl={dashboardUrl}
      actionText={isWorker ? 'Mark Shift as Done' : 'Review Shift'}
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{recipientName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        {isWorker
          ? `Your shift has ended and is waiting to be marked as done. Please submit it in SwapBoard as soon as possible so your manager can approve your completion.`
          : `The following shift has ended but has not been marked as complete by the assigned worker. Please follow up.`}
      </p>

      <WarningBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Ended at" value={endedAt} />
          <DetailRow label="Status" value="Not marked as done" />
        </DetailTable>
      </WarningBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        {isWorker
          ? 'Delays in marking shifts as done may affect your attendance record.'
          : 'You can review and update the shift status from your dashboard.'}
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
