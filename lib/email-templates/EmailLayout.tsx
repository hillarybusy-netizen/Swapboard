import React from 'react';

interface EmailLayoutProps {
  title: string;
  children: React.ReactNode;
  actionUrl?: string;
  actionText?: string;
}

export function EmailLayout({ title, children, actionUrl, actionText }: EmailLayoutProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37 0%, #c99f30 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
          .content { background: #ffffff; padding: 30px 20px; border: 1px solid #e5e5e5; border-top: none; }
          .content p { margin: 0 0 15px 0; }
          .action-button { display: inline-block; background: #d4af37; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .action-button:hover { background: #c99f30; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px; }
          .divider { border-top: 1px solid #e5e5e5; margin: 20px 0; }
          .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .success-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .meta { color: #999; font-size: 12px; margin-top: 10px; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>🔔 {title}</h1>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.9 }}>SwapBoard Notifications</p>
          </div>

          <div className="content">
            {children}

            {actionUrl && actionText && (
              <div style={{ textAlign: 'center' }}>
                <a href={actionUrl} className="action-button">
                  {actionText}
                </a>
              </div>
            )}
          </div>

          <div className="footer">
            <p>© {new Date().getFullYear()} SwapBoard. All rights reserved.</p>
            <p>You're receiving this email because you have notifications enabled in SwapBoard.</p>
            <p>
              <a href="{preferencesUrl}" style={{ color: '#666', textDecoration: 'none' }}>
                Manage Preferences
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
