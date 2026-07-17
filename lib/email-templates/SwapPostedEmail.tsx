import React from 'react';
import { EmailLayout, InfoBox, DetailTable, DetailRow, Divider } from './EmailLayout';

interface SwapPostedProps {
  departmentWorkerName: string;
  originalWorkerName: string;
  shiftTitle: string;
  shiftDate: string;
  reason?: string;
  dashboardUrl: string;
}

export function SwapPostedEmail({
  departmentWorkerName,
  originalWorkerName,
  shiftTitle,
  shiftDate,
  reason,
  dashboardUrl,
}: SwapPostedProps) {
  return (
    <EmailLayout
      title="Shift Available for Swap 🔄"
      previewText={`${originalWorkerName} posted a shift you might be able to cover.`}
      actionUrl={dashboardUrl}
      actionText="Offer to Cover"
    >
      <p style={{ margin: '0 0 20px', fontSize: 15 }}>
        Hi <strong>{departmentWorkerName}</strong>,
      </p>

      <p style={{ margin: '0 0 20px', fontSize: 15, color: '#374151' }}>
        A colleague in your department has posted a shift for swap. If you&apos;re available, you can
        offer to cover it directly from your SwapBoard dashboard.
      </p>

      <InfoBox>
        <DetailTable>
          <DetailRow label="Shift" value={shiftTitle} />
          <DetailRow label="Date" value={shiftDate} />
          <DetailRow label="Posted by" value={originalWorkerName} />
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
        Tap the button above to view the shift details and offer to cover. First come, first served.
      </p>
      <p style={{ margin: '24px 0 0', fontSize: 14, color: '#6B7280' }}>The SwapBoard Team</p>
    </EmailLayout>
  );
}
