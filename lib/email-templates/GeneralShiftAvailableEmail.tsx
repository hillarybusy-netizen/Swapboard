import React from 'react';
import { EmailLayout, InfoBox, WarningBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface GeneralShiftAvailableProps {
  workerName: string;
  shiftTitle: string;
  shiftDate: string;
  shiftTime: string;
  departmentName?: string;
  notes?: string;
  dashboardUrl: string;
}

export function GeneralShiftAvailableEmail({
  workerName,
  shiftTitle,
  shiftDate,
  shiftTime,
  departmentName,
  notes,
  dashboardUrl,
}: GeneralShiftAvailableProps) {
  return (
    <EmailLayout
      title="General Shift Available 📢"
      previewText={`A new unassigned shift is available: ${shiftTitle} on ${shiftDate}.`}
      actionUrl={dashboardUrl}
      actionText="Claim This Shift"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{workerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        A new unassigned shift is available for claiming. If you&apos;re free and interested, grab
        it before someone else does — it&apos;s first come, first served.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Time" value={shiftTime} />
          {departmentName ? <DetailRow label="Department" value={departmentName} /> : <></>}
        </DetailTable>
      </InfoBox>

      {notes && (
        <>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Shift notes
          </p>
          <WarningBox>
            <p style={{ margin: 0 }}>{notes}</p>
          </WarningBox>
        </>
      )}

      <Divider />
      <p style={{ margin: '0 0 4px', fontSize: 14, color: '#6B7280' }}>
        Tap the button above to view the full details and claim the shift in SwapBoard.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
