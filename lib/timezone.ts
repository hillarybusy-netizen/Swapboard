// Get user's timezone from browser
export function detectUserTimezone(): string {
  if (typeof window === "undefined") return "UTC";

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// List of common timezones
export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Brussels",
  "Europe/Vienna",
  "Europe/Prague",
  "Europe/Stockholm",
  "Europe/Athens",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Perth",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Africa/Lagos",
];

// Convert a date from one timezone to another
export function convertTimezone(
  date: Date,
  fromTimezone: string,
  toTimezone: string
): Date {
  // Create formatter for source timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: fromTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Get the date parts in the source timezone
  const parts = formatter.formatToParts(date);
  const partsObj: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    partsObj[type] = value;
  });

  // Create a date string in ISO format
  const dateString = `${partsObj.year}-${partsObj.month}-${partsObj.day}T${partsObj.hour}:${partsObj.minute}:${partsObj.second}`;
  const localDate = new Date(dateString);

  // Get the offset between the source and target timezones
  const targetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: toTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const targetParts = targetFormatter.formatToParts(new Date());
  const targetPartsObj: Record<string, string> = {};
  targetParts.forEach(({ type, value }) => {
    targetPartsObj[type] = value;
  });

  const targetDateString = `${targetPartsObj.year}-${targetPartsObj.month}-${targetPartsObj.day}T${targetPartsObj.hour}:${targetPartsObj.minute}:${targetPartsObj.second}`;
  const targetDate = new Date(targetDateString);

  // Calculate offset difference
  const offset = localDate.getTime() - targetDate.getTime();

  // Apply offset to original date
  return new Date(date.getTime() - offset);
}

// Format a date in a specific timezone
export function formatInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    ...options,
  }).format(date);
}

// Get timezone offset string (e.g., "UTC-5")
export function getTimezoneOffset(timezone: string): string {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  const diffMs = tzDate.getTime() - utcDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const sign = diffHours >= 0 ? "+" : "";
  return `UTC${sign}${diffHours}`;
}
