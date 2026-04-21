import { differenceInDays, isPast } from "date-fns";
import type { Organization } from "@/lib/database.types";

export interface TrialStatus {
  isOnTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  percentUsed: number;
  trialLength: number;
}

export const TRIAL_LENGTH_DAYS = 14;

export function getTrialStatus(org: Organization | null): TrialStatus {
  if (!org) {
    return { isOnTrial: false, isExpired: false, daysRemaining: 0, percentUsed: 100, trialLength: TRIAL_LENGTH_DAYS };
  }

  if (org.plan !== "trial") {
    return { isOnTrial: false, isExpired: false, daysRemaining: 999, percentUsed: 0, trialLength: TRIAL_LENGTH_DAYS };
  }

  const endDate = new Date(org.trial_ends_at);
  const isExpired = isPast(endDate);
  const daysRemaining = Math.max(0, differenceInDays(endDate, new Date()));
  const daysUsed = TRIAL_LENGTH_DAYS - daysRemaining;
  const percentUsed = Math.min(100, Math.round((daysUsed / TRIAL_LENGTH_DAYS) * 100));

  return {
    isOnTrial: true,
    isExpired,
    daysRemaining,
    percentUsed,
    trialLength: TRIAL_LENGTH_DAYS,
  };
}

export function getTrialBannerMessage(status: TrialStatus): string {
  if (status.isExpired) return "Your trial has expired. Upgrade to keep your data.";
  if (status.daysRemaining <= 1) return "Your trial expires today! Upgrade now.";
  if (status.daysRemaining <= 3) return `${status.daysRemaining} days left in your trial.`;
  return `${status.daysRemaining} days remaining in your trial.`;
}

export function getTrialBannerVariant(status: TrialStatus): "destructive" | "warning" | "default" {
  if (status.isExpired) return "destructive";
  if (status.daysRemaining <= 3) return "warning";
  return "default";
}

export function needsSubscription(org: Organization | null): boolean {
  if (!org) return false;
  
  // If they are on a trial that has expired, they need a subscription
  if (org.plan === "trial") {
    const endDate = new Date(org.trial_ends_at);
    return isPast(endDate);
  }
  
  return false;
}
