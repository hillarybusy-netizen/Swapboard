import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatShiftDate, formatShiftTime, timeAgo } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function swapStatusBadge(status: string) {
  const map: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    manager_approved: { label: "Approved ✓", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
  };
  return map[status] ?? { label: status, color: "text-white/40 bg-white/5 border-white/5", icon: Clock };
}

export default async function SwapHistoryPage() {
  const { user } = await getCachedSession();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: historyData } = await supabase
    .from("swap_requests")
    .select(
      "*, shift:shifts(id, title, start_time, end_time, department:departments(name, color)), covering_worker:profiles!covering_worker_id(full_name)"
    )
    .eq("requester_id", user.id)
    .in("status", ["manager_approved", "rejected"])
    .order("requested_at", { ascending: false });

  const history = (historyData ?? []) as any[];
  const approvedCount = history.filter((s) => s.status === "manager_approved").length;
  const rejectedCount = history.filter((s) => s.status === "rejected").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/swap"
          className="w-10 h-10 rounded-2xl glass border border-white/10 flex items-center justify-center hover:border-gold/30 hover:bg-gold/5 transition-all duration-200 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-white/50" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-0.5">
            Swap History
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            All resolved swap requests
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center border border-white/5">
          <span className="text-2xl font-black text-white block">{history.length}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Total</span>
        </div>
        <div className="glass rounded-2xl p-4 text-center border border-emerald-500/15">
          <span className="text-2xl font-black text-emerald-400 block">{approvedCount}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Approved</span>
        </div>
        <div className="glass rounded-2xl p-4 text-center border border-red-500/10">
          <span className="text-2xl font-black text-red-400 block">{rejectedCount}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Rejected</span>
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-white/15" />
          </div>
          <p className="text-sm font-bold text-white/30">No history yet</p>
          <p className="text-[11px] text-white/20 mt-1">
            Approved and rejected swap requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((swap) => {
            const badge = swapStatusBadge(swap.status);
            const StatusIcon = badge.icon;
            const isApproved = swap.status === "manager_approved";

            return (
              <div
                key={swap.id}
                className={cn(
                  "glass rounded-2xl p-5 border relative overflow-hidden",
                  isApproved
                    ? "border-emerald-500/15 bg-emerald-500/3"
                    : "border-red-500/10 bg-red-500/3"
                )}
              >
                {/* Subtle glow */}
                <div
                  className={cn(
                    "absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full pointer-events-none",
                    isApproved ? "bg-emerald-500/8" : "bg-red-500/5"
                  )}
                />

                <div className="relative z-10">
                  {/* Title & badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-white truncate">
                        {swap.shift?.title ?? "Shift"}
                      </p>
                      {swap.shift?.department && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: swap.shift.department.color || "#d4af37" }}
                          />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {swap.shift.department.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                        badge.color
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>

                  {/* Date & time */}
                  {swap.shift && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatShiftDate(swap.shift.start_time)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                        <Clock className="w-3.5 h-3.5" />
                        {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}
                      </span>
                    </div>
                  )}

                  {/* Reason */}
                  {swap.reason && (
                    <p className="text-[11px] text-white/30 italic mb-3">
                      &ldquo;{swap.reason}&rdquo;
                    </p>
                  )}

                  {/* Outcome banner */}
                  {isApproved && swap.covering_worker && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/15 mb-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <p className="text-[11px] font-bold text-emerald-300/80">
                        Covered by {swap.covering_worker.full_name} — swap complete
                      </p>
                    </div>
                  )}

                  {!isApproved && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/15 mb-3">
                      <Ban className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <p className="text-[11px] font-bold text-red-300/70">
                        Swap was rejected — shift returned to you
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    {timeAgo(swap.requested_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
