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
  const button = buttonText && buttonUrl
    ? `<div style="margin-top: 30px; margin-bottom: 30px;">
        <a href="${buttonUrl}" style="background-color: #FFD700; color: #050505; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">
          ${buttonText}
        </a>
      </div>`
    : "";

  const linkFallback = buttonUrl
    ? `<p style="font-size: 12px; color: rgba(255,255,255,0.3);">
        If the button above doesn't work, copy and paste this link into your browser:<br/>
        <a href="${buttonUrl}" style="color: #FFD700;">${buttonUrl}</a>
      </p>`
    : "";

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: white; border-radius: 20px;">
      <h1 style="color: #FFD700; margin-bottom: 20px;">SwapBoard</h1>
      <p style="font-size: 16px; line-height: 1.5; color: rgba(255,255,255,0.7);">${body}</p>
      ${button}
      ${linkFallback}
      <p style="font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
        ${footer ?? "© SwapBoard — Shift Management Made Simple"}
      </p>
    </div>
  `;
}

export function isResendConfigured() {
  return !!(resendApiKey() && !resendApiKey()!.startsWith("re_123"));
}

export function resendApiKey() {
  return process.env.RESEND_API_KEY ?? null;
}
