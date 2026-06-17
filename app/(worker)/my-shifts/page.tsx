import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration } from "@/lib/utils";
import { Calendar, Clock, Timer, ArrowLeftRight, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MarkDoneButton } from "@/components/shifts/MarkDoneButton";

export const dynamic = "force-dynamic";

type TabKey = "all" | "upcoming" | "completed" | "swapped";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "swapped", label: "Swapped" },
];

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    not_started: { label: "Upcoming", color: "text-white/50 bg-white/10" },
    started: {
      label: "In Progress",
      color: "text-blue-400 bg-blue-500/15 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]",
    },
    up_for_swap: { label: "Up for Swap", color: "text-purple-400 bg-purple-500/15 border border-purple-500/20" },
    pending_approval_claim: { label: "Claim Pending", color: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20" },
    pending_approval_swap: { label: "Swap Pending", color: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20" },
    swapped: { label: "Swapped", color: "text-white/30 bg-white/5 border border-white/10" },
    overdue_not_done: { label: "Overdue !", color: "text-orange-400 bg-orange-500/15 border border-orange-500/20" },
    done_pending_approval: { label: "Awaiting Approval", color: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20" },
    done_manager_approved: { label: "Completed ✓", color: "text-emerald-400 bg-emerald-500/15 border border-emerald-500/20" },
    done_rejected: { label: "Rejected — check notes", color: "text-red-400 bg-red-500/15 border border-red-500/20" },
    no_show: { label: "No-Show", color: "text-red-400 bg-red-500/15 border border-red-500/20" },
    cancelled: { label: "Cancelled", color: "text-white/20 bg-white/5" },
  };
  return map[status] ?? { label: status, color: "text-white/40 bg-white/5" };
}

function filterShifts(shifts: any[], tab: TabKey) {
  if (tab === "all") return shifts;
  if (tab === "upcoming")
    return shifts.filter((s) =>
      ["not_started", "started", "up_for_swap", "pending_approval_claim", "pending_approval_swap", "overdue_not_done"].includes(s.status)
    );
  if (tab === "completed")
    return shifts.filter((s) =>
      ["done_pending_approval", "done_manager_approved", "done_rejected"].includes(s.status)
    );
  if (tab === "swapped") return shifts.filter((s) => s.status === "swapped" || s.status === "no_show");
  return shifts;
}

export default async function MyShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const currentTab = (params.tab as TabKey) || "all";

  const supabase = await createClient();

  const { data: allShiftsData } = await supabase
    .from("shifts")
    .select("*, department:departments(*)")
    .eq("assigned_to", user.id)
    .is("deleted_at", null)
    .order("start_time", { ascending: false });

  const allShifts = (allShiftsData ?? []) as any[];
  const displayShifts = filterShifts(allShifts, currentTab);

  const upcomingCount = filterShifts(allShifts, "upcoming").length;
  const completedCount = filterShifts(allShifts, "completed").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">My Shifts</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          {allShifts.length} Total ·{" "}
          <span className="text-gold/50">{upcomingCount} Upcoming</span>
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center border border-white/5">
          <span className="text-2xl font-black text-gold block">{upcomingCount}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Upcoming</span>
        </div>
        <div className="glass rounded-2xl p-4 text-center border border-white/5">
          <span className="text-2xl font-black text-emerald-400 block">{completedCount}</span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Completed</span>
        </div>
        <div className="glass rounded-2xl p-4 text-center border border-white/5">
          <span className="text-2xl font-black text-purple-400 block">
            {allShifts.filter((s) => s.status === "swapped").length}
          </span>
          <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">Swapped</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass rounded-full p-1.5 flex gap-1 border border-white/5">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`?tab=${tab.key}`}
            className={cn(
              "flex-1 py-2.5 rounded-full text-[10px] font-black text-center transition-all duration-200",
              currentTab === tab.key
                ? "bg-gold text-[#050505] shadow-md"
                : "text-white/40 hover:text-white"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Shift List */}
      <div className="space-y-3">
        {displayShifts.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center border border-white/5">
            <Calendar className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/30">No shifts here</p>
            <p className="text-[11px] text-white/20 mt-1">
              {currentTab === "upcoming" ? "No upcoming shifts assigned to you." : "Nothing to show in this category."}
            </p>
          </div>
        ) : (
          displayShifts.map((shift) => {
            const badge = statusBadge(shift.status);
            const canMarkDone = shift.status === "started" || shift.status === "overdue_not_done";
            const canPostSwap = shift.status === "not_started" || shift.status === "started";
            const isOverdue = shift.status === "overdue_not_done";

            return (
              <div
                key={shift.id}
                className={cn(
                  "glass rounded-2xl p-5 border relative overflow-hidden scroll-item glass-item-transition",
                  isOverdue
                    ? "border-orange-500/20 bg-orange-500/3"
                    : shift.status === "done_manager_approved"
                    ? "border-emerald-500/15"
                    : "border-white/5"
                )}
              >
                {/* Overdue pulse */}
                {isOverdue && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-2xl rounded-full" />
                )}

                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate">{shift.title}</h3>
                    {shift.department && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: shift.department.color || "#d4af37" }}
                        />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          {shift.department.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      badge.color
                    )}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Date / Time / Duration row */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatShiftDate(shift.start_time)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    {formatShiftTime(shift.start_time, shift.end_time)}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/30">
                    <Timer className="w-3.5 h-3.5" />
                    {formatShiftDuration(shift.start_time, shift.end_time)}
                  </span>
                </div>

                {/* Notes / rejection notes */}
                {shift.status === "done_rejected" && shift.notes && (
                  <div className="mb-3 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/15 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-300/80 font-medium">{shift.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {(canMarkDone || canPostSwap) && (
                  <div className="flex gap-2 mt-1">
                    {canMarkDone && (
                      <div className="flex-1">
                        <MarkDoneButton shiftId={shift.id} shiftTitle={shift.title} />
                      </div>
                    )}
                    {canPostSwap && (
                      <Link
                        href={`/swap?post=${shift.id}`}
                        className="
                          flex items-center justify-center gap-2
                          h-11 px-4 rounded-2xl flex-1
                          bg-purple-500/10 border border-purple-500/20
                          text-purple-300 text-[10px] font-black uppercase tracking-widest
                          hover:bg-purple-500/20 hover:border-purple-500/40
                          transition-all duration-200
                        "
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        Post for Swap
                      </Link>
                    )}
                  </div>
                )}

                {/* Swapped indicator */}
                {shift.status === "swapped" && (
                  <div className="flex items-center gap-2 mt-1 px-3 py-2 rounded-xl bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                      Shift successfully swapped
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
