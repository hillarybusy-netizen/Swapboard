const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.swapboard.ca';
const LOGO_URL = `${APP_URL}/logo.png`;

export function swapboardEmailHtml({
  title,
  body,
  buttonText,
  buttonUrl,
  footer,
}: {
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
  footer?: string;
}) {
  const button =
    buttonText && buttonUrl
      ? `
        <div style="text-align:center;margin:32px 0 8px;">
          <a href="${buttonUrl}"
             style="display:inline-block;background-color:#D4AF37;color:#0F0F0F;padding:14px 36px;
                    border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;
                    letter-spacing:0.2px;">
            ${buttonText} →
          </a>
        </div>
        <p style="text-align:center;margin:14px 0 0;font-size:12px;color:#9CA3AF;">
          Or copy this link:
          <a href="${buttonUrl}" style="color:#D4AF37;word-break:break-all;text-decoration:none;">
            ${buttonUrl}
          </a>
        </p>`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F4F5;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#F4F4F5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0F0F0F 0%,#1C1A14 100%);
                        border-radius:16px 16px 0 0;padding:32px 40px 28px;
                        text-align:center;border-bottom:3px solid #D4AF37;">
              <img src="${LOGO_URL}" alt="SwapBoard" width="64" height="64"
                   style="display:block;margin:0 auto 14px;width:64px;height:64px;object-fit:contain;"/>
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#D4AF37;">
                SwapBoard
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.4);
                         letter-spacing:0.5px;text-transform:uppercase;">
                Shift Management
              </p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px 40px 32px;
                        color:#111111;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 24px;font-size:20px;font-weight:700;
                          color:#0F0F0F;line-height:1.3;">
                ${title}
              </p>
              <div style="color:#374151;font-size:15px;line-height:1.7;">
                ${body}
              </div>
              ${button}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#FAFAFA;border-top:1px solid #E5E7EB;
                        border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6B7280;">
                ${footer ?? "You're receiving this because you have an account on SwapBoard."}
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © ${new Date().getFullYear()} SwapBoard Inc. · Shift Management Made Simple
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function isResendConfigured() {
  return !!(resendApiKey() && !resendApiKey()!.startsWith('re_123'));
}

export function resendApiKey() {
  return process.env.RESEND_API_KEY ?? null;
}
