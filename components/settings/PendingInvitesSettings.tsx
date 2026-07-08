"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RevokeInviteButton } from "@/components/team/RevokeInviteButton";
import { UserPlus, Clock } from "lucide-react";

interface PendingInvite {
  id: string;
  email: string | null;
  user_role: string;
  created_at: string;
}

export function PendingInvitesSettings({ invites }: { invites: PendingInvite[] }) {
  if (invites.length === 0) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
          <UserPlus className="w-6 h-6 text-white/20" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">No pending invitations</h2>
          <p className="text-sm text-white/40 mt-1 max-w-sm mx-auto">
            Invites you send from the Team tab will appear here until they&apos;re accepted.
          </p>
        </div>
        <Link
          href="/settings?tab=team"
          className="inline-flex text-xs font-black uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
        >
          Go to Invite Team →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight">Pending Invitations</h2>
        <p className="text-sm text-white/40 mt-1">
          {invites.length} invite{invites.length !== 1 ? "s" : ""} waiting to be accepted
        </p>
      </div>

      <div className="space-y-3">
        {invites.map((inv) => (
          <div
            key={inv.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass rounded-2xl border border-dashed border-white/10 p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 text-xs font-black shrink-0">
                ?
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {inv.email ?? "Manual link invite"}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Sent {new Date(inv.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge className="bg-white/5 text-white/50 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none">
                {inv.user_role}
              </Badge>
              <RevokeInviteButton id={inv.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
