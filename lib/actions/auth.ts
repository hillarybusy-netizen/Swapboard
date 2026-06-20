"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";
import { swapboardEmailHtml, isResendConfigured } from "@/lib/email-template";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const DISALLOWED_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"];

function getAllowedDevEmails(): string[] {
  const fromEnv = process.env.ALLOWED_DEV_EMAILS;
  return fromEnv ? fromEnv.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean) : [];
}

export async function registerUser({
  email,
  password,
  fullName,
  honeypot,
}: {
  email: string;
  password: string;
  fullName: string;
  honeypot?: string;
}) {
  // 1. Honeypot check (invisible bot trap)
  if (honeypot) {
    // Silently return success to fool the bot
    return { success: true, userId: "bot-trap" };
  }

  // 2. IP Rate Limiting (5 requests per minute)
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`register_${ip}`, 5, 60000);
  if (!rl.success) {
    return { success: false, error: rl.error };
  }

  // 3. Payload Hardening
  if (password.length > 72) {
    return { success: false, error: "Password is too long." };
  }
  const normalizedEmail = email.trim().toLowerCase();
  const emailDomain = normalizedEmail.split("@")[1];
  const isDisallowedDomain = DISALLOWED_DOMAINS.includes(emailDomain);
  const isAllowedException = getAllowedDevEmails().includes(normalizedEmail);

  if (isDisallowedDomain && !isAllowedException) {
    return { success: false, error: "Please use your professional work email to sign up." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName.trim() },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (isResendConfigured() && resend) {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
    try {
      await resend.emails.send({
        from: "SwapBoard <no-reply@swapboard.ca>",
        to: normalizedEmail,
        subject: "Welcome to SwapBoard",
        html: swapboardEmailHtml({
          title: "Welcome to SwapBoard",
          body: `Hi ${fullName.trim()},<br/><br/>Your SwapBoard account has been created. Sign in to start your free 14-day trial and set up your workspace.`,
          buttonText: "Sign In to SwapBoard",
          buttonUrl: loginUrl,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
  }

  return { success: true, userId: data.user.id };
}

export async function sendPasswordResetEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { success: false, error: "Email is required" };
  }

  // Rate limit: max 3 reset emails per minute per IP (prevents email flooding)
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`pw_reset_${ip}`, 3, 60000);
  if (!rl.success) {
    // Return generic success to not leak whether email exists
    return { success: true };
  }

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (error) {
    console.error("Password reset generateLink error:", error);
    return { success: true };
  }

  const resetLink = data.properties.action_link;

  if (!isResendConfigured() || !resend) {
    return { success: false, error: "Email service is not configured." };
  }

  try {
    await resend.emails.send({
      from: "SwapBoard <no-reply@swapboard.ca>",
      to: normalizedEmail,
      subject: "Reset your SwapBoard password",
      html: swapboardEmailHtml({
        title: "Reset your SwapBoard password",
        body: "You requested a password reset for your SwapBoard account.",
        buttonText: "Reset My Password",
        buttonUrl: resetLink,
        footer: "If you didn't request this, you can safely ignore this email.<br/>© SwapBoard — Shift Management Made Simple",
      }),
    });
  } catch (emailError) {
    console.error("Failed to send password reset email:", emailError);
    return { success: false, error: "Failed to send reset email. Please try again." };
  }

  return { success: true };
}

export async function signInUser({
  email,
  password,
  honeypot,
}: {
  email: string;
  password: string;
  honeypot?: string;
}) {
  // 1. Honeypot check
  if (honeypot) {
    // Silently drop bot
    return { success: false, error: "Invalid credentials" };
  }

  // 2. IP Rate Limiting (10 requests per minute)
  const ip = (await headers()).get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`login_${ip}`, 10, 60000);
  if (!rl.success) {
    return { success: false, error: rl.error };
  }

  // 3. Length checks
  if (password.length > 72) {
    return { success: false, error: "Invalid credentials." };
  }

  // 4. Check if user exists by querying profiles table
  const adminClient = createAdminClient();
  const { data: existingUser } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .single();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // If user doesn't exist, return specific error message
    if (!existingUser) {
      return { success: false, error: "no_registered_account" };
    }
    // User exists but password is wrong
    return { success: false, error: "incorrect_password" };
  }

  return { success: true };
}
