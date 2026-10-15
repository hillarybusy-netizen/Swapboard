import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const WEBSITE_ANALYTICS_COOKIE = "website-analytics-access";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function getSessionSecret() {
  const secret = process.env.WEBSITE_ANALYTICS_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("WEBSITE_ANALYTICS_SESSION_SECRET must be at least 32 characters.");
  }
  return secret;
}

export function isWebsiteAnalyticsPasswordConfigured() {
  return Boolean(process.env.WEBSITE_ANALYTICS_PASSWORD);
}

export function isWebsiteAnalyticsSessionSecretConfigured() {
  return (process.env.WEBSITE_ANALYTICS_SESSION_SECRET?.length ?? 0) >= 32;
}

export function verifyWebsiteAnalyticsPassword(password: string) {
  const expected = process.env.WEBSITE_ANALYTICS_PASSWORD;
  if (!expected) return false;

  const actualBytes = Buffer.from(password);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

function signExpiry(expiry: string) {
  return createHmac("sha256", getSessionSecret()).update(expiry).digest("hex");
}

export function createWebsiteAnalyticsSession() {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS);
  return {
    value: `${expiry}.${signExpiry(expiry)}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function isWebsiteAnalyticsSessionValid(value?: string) {
  if (!value) return false;
  const [expiry, signature, ...extra] = value.split(".");
  if (!expiry || !signature || extra.length > 0 || !/^\d+$/.test(expiry)) return false;
  if (Number(expiry) <= Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = Buffer.from(signExpiry(expiry), "hex");
  const actualSignature = Buffer.from(signature, "hex");
  return (
    actualSignature.length === expectedSignature.length &&
    timingSafeEqual(actualSignature, expectedSignature)
  );
}
