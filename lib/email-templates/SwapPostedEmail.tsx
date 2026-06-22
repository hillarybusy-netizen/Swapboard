import React from 'react';
import { EmailLayout } from './EmailLayout';

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
      title="Shift Available for Swap"
      actionUrl={dashboardUrl}
      actionText="View Available Swaps"
    >
      <p>Hi {departmentWorkerName},</p>

      <p>{originalWorkerName} has posted their shift for swap in your department. If you're interested in covering this shift, you can offer to take it!</p>

      <div className="info-box">
        <p style={{ margin: 0 }}>
          <strong>Shift:</strong> {shiftTitle}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Date:</strong> {shiftDate}
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          <strong>Original Worker:</strong> {originalWorkerName}
        </p>
      </div>

      {reason && (
        <>
          <p>
            <strong>Reason for Swap:</strong>
          </p>
          <div className="warning-box">
            <p style={{ margin: 0 }}>{reason}</p>
          </div>
        </>
      )}

      <p>
        If you'd like to cover this shift, log in to SwapBoard and click "Offer to Cover". Your manager will review your offer and let you know if it's approved.
      </p>

      <p>
        Hope this helps out your team!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
