"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";

export async function sendPasswordResetEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, error: "Email is required" };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (error) {
    // Don't reveal whether the account exists
    console.error("Password reset generateLink error:", error);
    return { success: true };
  }

  const resetLink = data.properties.action_link;

  try {
    if (!resend || !process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith("re_123")) {
      console.warn("RESEND_API_KEY not configured correctly. Email not sent.");
      return { success: false, error: "Email service is not configured." };
    }

    await resend.emails.send({
      from: "SwapBoard <no-reply@swapboard.ca>",
      to: normalizedEmail,
      subject: "Reset your SwapBoard password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #050505; color: white; border-radius: 20px;">
          <h1 style="color: #FFD700; margin-bottom: 20px;">SwapBoard</h1>
          <p style="font-size: 16px; line-height: 1.5; color: rgba(255,255,255,0.7);">
            You requested a password reset for your SwapBoard account.
          </p>
          <div style="margin-top: 30px; margin-bottom: 30px;">
            <a href="${resetLink}" style="background-color: #FFD700; color: #050505; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="font-size: 12px; color: rgba(255,255,255,0.3);">
            If you didn't request this, you can safely ignore this email.<br/><br/>
            If the button above doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #FFD700;">${resetLink}</a>
          </p>
          <p style="font-size: 11px; color: rgba(255,255,255,0.2); margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            © SwapBoard — Shift Management Made Simple
          </p>
        </div>
      `,
    });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    return { success: false, error: "Failed to send reset email. Please try again." };
  }

  return { success: true };
}
