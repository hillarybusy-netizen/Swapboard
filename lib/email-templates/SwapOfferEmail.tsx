import React from 'react';
import { EmailLayout } from './EmailLayout';

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
      title="Swap Offer Received"
      actionUrl={dashboardUrl}
      actionText="View Swap Details"
    >
      <p>Hi {shiftOwnerName},</p>

      <p>Great news! {offeringWorkerName} has offered to cover your shift for swap in SwapBoard!</p>

      <div className="success-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Offered By:</strong> {offeringWorkerName}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Status:</strong> Awaiting manager approval
        </p>
      </div>

      <p>
        Your manager will review this swap offer and let you know if it's approved. Keep an eye on your SwapBoard dashboard for updates!
      </p>

      <p>
        Fingers crossed!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
