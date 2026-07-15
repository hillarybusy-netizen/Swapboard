import React from 'react';
import { EmailLayout, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface ShiftStartingSoonProps {
  workerName: string;
  shiftTitle: string;
  startTime: string;
  dashboardUrl: string;
}

export function ShiftStartingSoonEmail({
  workerName,
  shiftTitle,
  startTime,
  dashboardUrl,
}: ShiftStartingSoonProps) {
  return (
    <EmailLayout
      title="Your Shift Starts Soon ⏰"
      previewText={`Reminder: ${shiftTitle} starts at ${startTime}. See you soon!`}
      accentColor="#6366F1"
      actionUrl={dashboardUrl}
      actionText="View My Shifts"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        Just a heads-up — your shift is coming up soon. Make sure you're ready to go on time!
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Start time" value={startTime} />
        </DetailTable>
      </InfoBox>

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Remember to mark your shift as started in SwapBoard once you begin.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
