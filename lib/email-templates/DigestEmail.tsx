import React from 'react';
import { EmailLayout } from './EmailLayout';

interface DigestItem {
  title: string;
  description: string;
  count?: number;
}

interface DigestEmailProps {
  userName: string;
  userRole: 'worker' | 'manager' | 'org_admin';
  items: {
    pending_approvals?: DigestItem[];
    assigned_shifts?: DigestItem[];
    swap_updates?: DigestItem[];
    overdue_items?: DigestItem[];
  };
  dashboardUrl: string;
}

export function DigestEmail({ userName, userRole, items, dashboardUrl }: DigestEmailProps) {
  const hasItems = Object.values(items).some((section) => section && section.length > 0);

  return (
    <EmailLayout
      title={`Your Daily ${userRole === 'manager' ? 'Management' : 'Work'} Summary`}
      actionUrl={dashboardUrl}
      actionText="Go to Dashboard"
    >
      <p>Hi {userName},</p>

      <p>Here's your daily summary from SwapBoard:</p>

      {items.pending_approvals && items.pending_approvals.length > 0 && (
        <>
          <h3 style={{ color: '#d4af37', marginTop: '25px' }}>
            ⏳ Pending Approvals ({items.pending_approvals.length})
          </h3>
          {items.pending_approvals.map((item, i) => (
            <div key={i} className="info-box">
              <p style={{ margin: 0 }}>
                <strong>{item.title}</strong>
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{item.description}</p>
            </div>
          ))}
        </>
      )}

      {items.assigned_shifts && items.assigned_shifts.length > 0 && (
        <>
          <h3 style={{ color: '#10b981', marginTop: '25px' }}>
            📋 Upcoming Shifts ({items.assigned_shifts.length})
          </h3>
          {items.assigned_shifts.map((item, i) => (
            <div key={i} className="success-box">
              <p style={{ margin: 0 }}>
                <strong>{item.title}</strong>
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{item.description}</p>
            </div>
          ))}
        </>
      )}

      {items.swap_updates && items.swap_updates.length > 0 && (
        <>
          <h3 style={{ color: '#3b82f6', marginTop: '25px' }}>
            🔄 Swap Updates ({items.swap_updates.length})
          </h3>
          {items.swap_updates.map((item, i) => (
            <div key={i} className="info-box">
              <p style={{ margin: 0 }}>
                <strong>{item.title}</strong>
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{item.description}</p>
            </div>
          ))}
        </>
      )}

      {items.overdue_items && items.overdue_items.length > 0 && (
        <>
          <h3 style={{ color: '#ef4444', marginTop: '25px' }}>
            ⚠️ Overdue Items ({items.overdue_items.length})
          </h3>
          {items.overdue_items.map((item, i) => (
            <div key={i} className="warning-box">
              <p style={{ margin: 0 }}>
                <strong>{item.title}</strong>
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{item.description}</p>
            </div>
          ))}
        </>
      )}

      {!hasItems && (
        <div className="success-box">
          <p style={{ margin: 0 }}>✅ All clear! You have no pending items at this time.</p>
        </div>
      )}

      <p style={{ marginTop: '30px' }}>
        Want to change how often you receive these digests? Update your preferences in SwapBoard.
      </p>

      <p>
        Thanks!
        <br />
        <span className="meta">SwapBoard Team</span>
      </p>
    </EmailLayout>
  );
}
