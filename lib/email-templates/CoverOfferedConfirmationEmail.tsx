import React from 'react';
import { EmailLayout } from './EmailLayout';

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
      title="Cover Offer Submitted"
      actionUrl={dashboardUrl}
      actionText="View Your Shifts"
    >
      <p>Hi {coverWorkerName},</p>

      <p>You have successfully offered to cover the shift from <strong>{originalWorkerName}</strong>. Your request is now pending manager approval.</p>

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

      <p>
        Your manager will review this swap and notify you once a decision has been made. Please do not assume the shift is yours until you receive a confirmation email.
      </p>

      <p>
        Thanks for stepping up!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
