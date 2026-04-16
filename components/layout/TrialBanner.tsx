import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { getTrialStatus, getTrialBannerMessage } from "@/lib/trial";
import type { Organization } from "@/lib/database.types";

export function TrialBanner({ org }: { org: Organization | null }) {
  if (!org) return null;
  const status = getTrialStatus(org);
  if (!status.isOnTrial) return null;

  const isUrgent = status.daysRemaining <= 3 || status.isExpired;

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-sm ${isUrgent ? "bg-red-50 text-red-800 border-b border-red-200" : "bg-amber-50 text-amber-800 border-b border-amber-200"}`}>
      <div className="flex items-center gap-2">
        {isUrgent && <AlertTriangle className="w-4 h-4 shrink-0" />}
        <span>{getTrialBannerMessage(status)}</span>
      </div>
      <Link
        href="/settings?tab=billing"
        className={`text-xs font-semibold underline shrink-0 ml-4 ${isUrgent ? "text-red-700" : "text-amber-700"}`}
      >
        Upgrade →
      </Link>
    </div>
  );
}
