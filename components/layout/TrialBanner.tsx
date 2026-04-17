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
    <div className={`m-4 mb-0 rounded-2xl glass border-white/5 p-4 flex items-center justify-between shadow-xl ${isUrgent ? "border-red-500/30" : "border-gold/20"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUrgent ? "bg-red-500/20 text-red-400" : "bg-gold/10 text-gold"}`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white tracking-tight">{getTrialBannerMessage(status)}</span>
          <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">{status.daysRemaining} days remaining</span>
        </div>
      </div>
      <Link
        href="/settings?tab=billing"
        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          isUrgent 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-gold text-[#050505] hover:shadow-lg hover:shadow-gold/20"
        }`}
      >
        Upgrade
      </Link>
    </div>
  );
}
