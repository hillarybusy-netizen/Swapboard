import React from 'react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.swapboard.ca';
const LOGO_URL = `${APP_URL}/logo.png`;

interface EmailLayoutProps {
  title: string;
  previewText?: string;
  children: React.ReactNode;
  actionUrl?: string;
  actionText?: string;
  accentColor?: string;
}

export function EmailLayout({
  title,
  previewText,
  children,
  actionUrl,
  actionText,
  accentColor = '#D4AF37',
}: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        {previewText && (
          <span
            style={{
              display: 'none',
              fontSize: 1,
              color: 'transparent',
              maxHeight: 0,
              overflow: 'hidden',
              opacity: 0,
            }}
          >
            {previewText}
          </span>
        )}
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#F4F4F5',
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          WebkitTextSizeAdjust: '100%',
          textSizeAdjust: '100%',
        }}
      >
        {/* Outer wrapper */}
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: '#F4F4F5', padding: '40px 16px' }}
        >
          <tbody>
            <tr>
              <td align="center">
                {/* Email card */}
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: 600, width: '100%' }}
                >
                  {/* ── HEADER ── */}
                  <tbody>
                    <tr>
                      <td
                        style={{
                          background: 'linear-gradient(135deg, #0F0F0F 0%, #1C1A14 100%)',
                          borderRadius: '16px 16px 0 0',
                          padding: '32px 40px 28px',
                          textAlign: 'center',
                          borderBottom: `3px solid ${accentColor}`,
                        }}
                      >
                        {/* Logo */}
                        <img
                          src={LOGO_URL}
                          alt="SwapBoard"
                          width={64}
                          height={64}
                          style={{
                            display: 'block',
                            margin: '0 auto 14px',
                            width: 64,
                            height: 64,
                            objectFit: 'contain',
                          }}
                        />
                        {/* Wordmark */}
                        <p
                          style={{
                            margin: 0,
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: '-0.3px',
                            color: accentColor,
                          }}
                        >
                          SwapBoard
                        </p>
                        <p
                          style={{
                            margin: '4px 0 0',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.4)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Shift Management
                        </p>
                      </td>
                    </tr>

                    {/* ── CONTENT ── */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: '#FFFFFF',
                          padding: '40px 40px 32px',
                          color: '#111111',
                          fontSize: 15,
                          lineHeight: 1.7,
                        }}
                      >
                        {/* Title badge */}
                        <p
                          style={{
                            margin: '0 0 24px',
                            fontSize: 20,
                            fontWeight: 700,
                            color: '#0F0F0F',
                            lineHeight: 1.3,
                          }}
                        >
                          {title}
                        </p>

                        {/* Slot for email body */}
                        <div style={{ color: '#374151' }}>{children}</div>

                        {/* CTA button */}
                        {actionUrl && actionText && (
                          <div style={{ textAlign: 'center', margin: '32px 0 8px' }}>
                            <a
                              href={actionUrl}
                              style={{
                                display: 'inline-block',
                                backgroundColor: accentColor,
                                color: '#0F0F0F',
                                padding: '14px 36px',
                                borderRadius: 50,
                                fontWeight: 700,
                                fontSize: 15,
                                letterSpacing: '0.2px',
                                textDecoration: 'none',
                              }}
                            >
                              {actionText} →
                            </a>
                            {/* Fallback link */}
                            <p style={{ margin: '16px 0 0', fontSize: 12, color: '#9CA3AF' }}>
                              Or copy this link:{' '}
                              <a
                                href={actionUrl}
                                style={{ color: accentColor, wordBreak: 'break-all', textDecoration: 'none' }}
                              >
                                {actionUrl}
                              </a>
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* ── FOOTER ── */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: '#FAFAFA',
                          borderTop: '1px solid #E5E7EB',
                          borderRadius: '0 0 16px 16px',
                          padding: '24px 40px',
                          textAlign: 'center',
                        }}
                      >
                        <p style={{ margin: '0 0 8px', fontSize: 12, color: '#6B7280' }}>
                          You're receiving this because you have notifications enabled in SwapBoard.
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                          © {new Date().getFullYear()} SwapBoard Inc. · Shift Management Made Simple
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

// ── Reusable styled blocks ──────────────────────────────────────────────────

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderLeft: '4px solid #0EA5E9',
        borderRadius: 8,
        padding: '16px 20px',
        margin: '20px 0',
        fontSize: 14,
        color: '#0C4A6E',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderLeft: '4px solid #22C55E',
        borderRadius: 8,
        padding: '16px 20px',
        margin: '20px 0',
        fontSize: 14,
        color: '#14532D',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#FFFBEB',
        border: '1px solid #FDE68A',
        borderLeft: '4px solid #F59E0B',
        borderRadius: 8,
        padding: '16px 20px',
        margin: '20px 0',
        fontSize: 14,
        color: '#78350F',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function DangerBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderLeft: '4px solid #EF4444',
        borderRadius: 8,
        padding: '16px 20px',
        margin: '20px 0',
        fontSize: 14,
        color: '#7F1D1D',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          padding: '10px 16px',
          fontSize: 13,
          color: '#6B7280',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '10px 16px',
          fontSize: 13,
          color: '#111827',
          borderBottom: '1px solid #F3F4F6',
          verticalAlign: 'top',
        }}
      >
        {value}
      </td>
    </tr>
  );
}

export function DetailTable({ children }: { children: React.ReactNode }) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 10,
        overflow: 'hidden',
        margin: '20px 0',
        backgroundColor: '#FAFAFA',
      }}
    >
      <tbody>{children}</tbody>
    </table>
  );
}

export function Divider() {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid #E5E7EB',
        margin: '24px 0',
      }}
    />
  );
}
