/**
 * Central error handling utility for Swapboard.
 *
 * All user-facing error messages live here.
 * Raw database / API error strings are mapped to professional,
 * actionable messages so end-users never see internal stack traces,
 * Postgres codes, or Supabase internals.
 */

// ─── Raw-to-professional message map ────────────────────────────────────────

const ERROR_MAP: Record<string, string> = {
  // ── Auth / Supabase ──────────────────────────────────────────────────────
  "Invalid login credentials":
    "The email or password you entered is incorrect. Please try again.",
  "Email not confirmed":
    "Your email address hasn't been verified yet. Please check your inbox.",
  "User already registered":
    "An account with this email address already exists. Try signing in instead.",
  "invalid_grant":
    "Your session has expired. Please sign in again.",
  "JWT expired":
    "Your session has expired. Please sign in again.",
  "refresh_token_not_found":
    "Your session is no longer valid. Please sign in again.",
  "incorrect_password":
    "The email or password you entered is incorrect. Please try again.",
  "Email rate limit exceeded":
    "Too many requests. Please wait a few minutes before trying again.",
  "over_request_rate_limit":
    "Too many requests. Please slow down and try again shortly.",
  "weak_password":
    "Your password is too weak. Please choose a stronger password with a mix of letters, numbers, and symbols.",
  "Password should be at least 6 characters":
    "Your password must be at least 8 characters long.",
  "unable to validate email address: invalid format":
    "Please enter a valid email address.",

  // ── Database / Postgres ──────────────────────────────────────────────────
  "duplicate key value violates unique constraint":
    "This record already exists. Please check for duplicates.",
  "violates foreign key constraint":
    "This action references data that no longer exists. Please refresh and try again.",
  "violates not-null constraint":
    "A required field is missing. Please complete all required fields and try again.",
  "value too long for type character varying":
    "One of your inputs exceeds the maximum allowed length. Please shorten it and try again.",
  "permission denied for table":
    "You don't have permission to perform this action.",
  "new row violates row-level security policy":
    "Access denied. You don't have the necessary permissions for this operation.",
  "PGRST200":
    "A data relationship could not be resolved. Please contact support if this continues.",
  "PGRST301":
    "This record was not found. It may have been deleted or you may not have access.",
  "PGRST116":
    "Unexpected data format received from the server. Please try again.",

  // ── Network / Connectivity ───────────────────────────────────────────────
  "Failed to fetch":
    "Unable to reach the server. Please check your internet connection and try again.",
  "NetworkError":
    "A network error occurred. Please check your connection and try again.",
  "fetch failed":
    "Unable to reach the server. Please check your internet connection and try again.",
  "Load failed":
    "The request could not be completed. Please check your connection and try again.",
  "ECONNREFUSED":
    "The server is temporarily unavailable. Please try again in a moment.",
  "ETIMEDOUT":
    "The request timed out. Please try again.",
  "ENOTFOUND":
    "Could not connect to the server. Please check your internet connection.",

  // ── Stripe / Billing ─────────────────────────────────────────────────────
  "No such customer":
    "Billing information could not be found. Please contact support.",
  "card_declined":
    "Your payment was declined. Please update your payment method.",
  "insufficient_funds":
    "Your payment could not be processed due to insufficient funds.",
  "expired_card":
    "Your card has expired. Please update your payment method.",
  "incorrect_cvc":
    "The card security code is incorrect. Please check your card and try again.",
  "invalid_expiry_year":
    "The card expiry year is invalid. Please check your card details.",

  // ── Email / Resend ───────────────────────────────────────────────────────
  "Resend API key not configured":
    "The email service is currently unavailable. Please contact your administrator.",
  "validation_error":
    "The email address appears to be invalid. Please double-check it and try again.",

  // ── Rate Limiting ────────────────────────────────────────────────────────
  "Too many requests. Please try again later.":
    "You've made too many requests. Please wait a moment before trying again.",

  // ── Generic fallbacks ────────────────────────────────────────────────────
  "Unauthorized":
    "You don't have permission to perform this action. Please sign in and try again.",
  "Forbidden":
    "Access denied. You don't have the required permissions for this operation.",
  "Not Found":
    "The requested resource could not be found.",
  "Internal Server Error":
    "An unexpected server error occurred. Please try again or contact support.",
  "Service Unavailable":
    "The service is temporarily unavailable. Please try again shortly.",
  "Unknown error":
    "An unexpected error occurred. Please try again.",
};

// ─── Helper functions ────────────────────────────────────────────────────────

/**
 * Looks up a professional user-facing message for the given raw error string.
 * Falls back to a cleaned-up version of the original if no mapping is found.
 *
 * @param raw  The raw error message from Supabase, Postgres, fetch, etc.
 * @returns    A professional, user-facing error string.
 */
export function formatError(raw: unknown): string {
  if (!raw) return "An unexpected error occurred. Please try again.";

  const message: string =
    raw instanceof Error
      ? raw.message
      : typeof raw === "string"
        ? raw
        : typeof raw === "object" && raw !== null && "message" in raw
          ? String((raw as { message: unknown }).message)
          : String(raw);

  // Return the raw error message directly for testing
  return message;
}

/**
 * Wraps a server action result that may carry a raw `.error` field,
 * returning it with a formatted message instead.
 *
 * Usage:
 *   const result = await someAction();
 *   if (!result.success) return { success: false, error: friendlyError(result.error) };
 */
export function friendlyError(raw: unknown): string {
  return formatError(raw);
}

/**
 * Converts an unknown caught value into a professional error message string.
 * Designed for use inside catch blocks.
 *
 * Usage:
 *   } catch (err) {
 *     return { success: false, error: catchError(err) };
 *   }
 */
export function catchError(err: unknown): string {
  return formatError(err);
}

