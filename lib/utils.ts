import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatShiftTime(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${format(s, "h:mm a")} – ${format(e, "h:mm a")}`;
}

export function formatShiftDate(date: string): string {
  return format(new Date(date), "EEE, MMM d");
}

export function formatShiftDuration(start: string, end: string): string {
  const hours = differenceInHours(new Date(end), new Date(start));
  const mins = differenceInMinutes(new Date(end), new Date(start)) % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const INDUSTRY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  healthcare: "Healthcare",
  retail: "Retail",
  hospitality: "Hospitality",
};

export const INDUSTRY_ICONS: Record<string, string> = {
  restaurant: "🍽️",
  healthcare: "🏥",
  retail: "🛍️",
  hospitality: "🏨",
};

export const INDUSTRY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  restaurant: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  healthcare: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  retail: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  hospitality: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

export const SWAP_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  worker_accepted: "Worker Accepted",
  manager_approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const SHIFT_STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  open: "Open",
  swap_pending: "Swap Pending",
  swapped: "Swapped",
  cancelled: "Cancelled",
};
