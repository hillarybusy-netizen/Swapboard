"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createWebsiteAnalyticsSession,
  isWebsiteAnalyticsPasswordConfigured,
  isWebsiteAnalyticsSessionSecretConfigured,
  verifyWebsiteAnalyticsPassword,
  WEBSITE_ANALYTICS_COOKIE,
} from "@/lib/website-analytics-access";

export async function unlockWebsiteAnalytics(formData: FormData) {
  await requireSuperAdmin();

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headerList.get("x-real-ip")
    || "unknown";
  const rateLimit = checkRateLimit(`website_analytics_${ip}`, 5, 60_000);
  if (!rateLimit.success) {
    return { success: false, error: "Too many attempts. Please try again in a minute." };
  }

  if (!isWebsiteAnalyticsPasswordConfigured()) {
    return { success: false, error: "The analytics page password is not configured on the server." };
  }
  if (!isWebsiteAnalyticsSessionSecretConfigured()) {
    return { success: false, error: "The analytics session secret must be at least 32 characters." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password.length > 256 || !verifyWebsiteAnalyticsPassword(password)) {
    return { success: false, error: "Incorrect password." };
  }

  const session = createWebsiteAnalyticsSession();
  const cookieStore = await cookies();
  cookieStore.set(WEBSITE_ANALYTICS_COOKIE, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/super-admin/website-analytics",
    maxAge: session.maxAge,
  });

  return { success: true, error: null };
}

export async function lockWebsiteAnalytics() {
  await requireSuperAdmin();
  const cookieStore = await cookies();
  cookieStore.set(WEBSITE_ANALYTICS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/super-admin/website-analytics",
    maxAge: 0,
  });
  redirect("/super-admin/website-analytics");
}
