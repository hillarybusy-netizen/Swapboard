import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, timeAgo } from "@/lib/utils";
import {
  ArrowLeftRight,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  PlusCircle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CancelSwapButton } from "@/components/swaps/CancelSwapButton";
import { WorkerSwapActions } from "@/components/swaps/WorkerSwapActions";
import { RequestSwapButton } from "@/components/shifts/RequestSwapButton";

export const dynamic = "force-dynamic";

function swapStatusBadge(status: string) {
  const map: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "Awaiting Cover", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    worker_accepted: { label: "Cover Found", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: UserCheck },
    manager_approved: { label: "Approved ✓", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
    cancelled: { label: "Cancelled", color: "text-white/25 bg-white/5 border-white/10", icon: XCircle },
  };
  return map[status] ?? { label: status, color: "text-white/40 bg-white/5 border-white/5", icon: Clock };
}

export default async function SwapPage({
  searchParams,
}: {
  searchParams: Promise<{ post?: string }>;
}) {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const params = await searchParams;
  const postShiftId = params.post ?? null;

  const supabase = await createClient();
  const orgId = profile?.organization_id;
  const deptId = profile?.department_id;

  // Pre-fill shift for posting (if ?post=SHIFT_ID)
  let postShift: any = null;
  if (postShiftId) {
    const { data } = await supabase
      .from("shifts")
      .select("id, title, start_time, end_time, status, assigned_to")
      .eq("id", postShiftId)
      .eq("assigned_to", user.id)
      .single();
    if (data && (data.status === "not_started" || data.status === "started")) {
      postShift = data;
    }
  }

  // Section A: My swap requests
  const { data: mySwapsData } = await supabase
    .from("swap_requests")
    .select(
      "*, shift:shifts(id, title, start_time, end_time, department:departments(name, color)), covering_worker:profiles!swap_requests_covering_worker_id_fkey(full_name)"
    )
    .eq("requester_id", user.id)
    .not("status", "eq", "cancelled")
    .order("requested_at", { ascending: false });

  const mySwaps = (mySwapsData ?? []) as any[];

  // Section B: Available swaps in same org (filtered to same dept if deptId exists)
  let availableQuery = supabase
    .from("swap_requests")
    .select(
      "*, shift:shifts(id, title, start_time, end_time, department_id, department:departments(name, color)), requester:profiles!swap_requests_requester_id_fkey(full_name, avatar_url)"
    )
    .eq("organization_id", orgId ?? "")
    .eq("status", "pending")
    .neq("requester_id", user.id)
    .is("covering_worker_id", null)
    .order("requested_at", { ascending: false });

  const { data: availableRaw } = await availableQuery;
  let availableSwaps = (availableRaw ?? []) as any[];

  // Filter to same department if user has one
  if (deptId) {
    availableSwaps = availableSwaps.filter(
      (s) => s.shift?.department_id === deptId
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
          Swap Board
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Post shifts · Claim cover · Manage exchanges
        </p>
      </div>

      {/* Post for Swap — pre-filled if ?post= is set */}
      {postShift && (
        <div className="glass rounded-2xl p-5 border border-gold/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/8 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-black text-gold">Post This Shift for Swap</p>
                <p className="text-[11px] text-white/40 font-medium">
                  {postShift.title} · {formatShiftDate(postShift.start_time)}
                </p>
              </div>
            </div>
            <RequestSwapButton shiftId={postShift.id} shiftTitle={postShift.title} />
          </div>
        </div>
      )}

      {/* Section A: My Swap Requests */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> My Posted Swaps
          </h2>
          <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2.5 py-1 rounded-full">
            {mySwaps.length}
          </span>
        </div>

        {mySwaps.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-white/5">
            <Inbox className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/30">No swap requests yet</p>
            <p className="text-[11px] text-white/20 mt-1">
              Go to My Shifts and tap &ldquo;Post for Swap&rdquo; on any upcoming shift.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySwaps.map((swap) => {
              const badge = swapStatusBadge(swap.status);
              const StatusIcon = badge.icon;
              return (
                <div
                  key={swap.id}
                  className="glass rounded-2xl p-5 border border-white/5 glass-item-transition scroll-item"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {swap.shift?.title ?? "Shift"}
                      </p>
                      {swap.shift?.department && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
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

                  {swap.reason && (
                    <p className="text-[11px] text-white/30 italic mb-3">
                      &ldquo;{swap.reason}&rdquo;
                    </p>
                  )}

                  {swap.covering_worker && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-blue-500/8 border border-blue-500/15">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      <p className="text-[11px] font-bold text-blue-300/80">
                        {swap.covering_worker.full_name} has offered to cover — awaiting manager
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                      {timeAgo(swap.requested_at)}
                    </span>
                    {swap.status === "pending" && (
                      <CancelSwapButton swapId={swap.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Section B: Available Swaps to Claim */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/50 flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5" /> Available to Cover
          </h2>
          <span className="text-[10px] font-bold text-white/20 bg-white/5 px-2.5 py-1 rounded-full">
            {availableSwaps.length} open
          </span>
        </div>

        {availableSwaps.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-white/5">
            <ArrowLeftRight className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/30">No swaps available</p>
            <p className="text-[11px] text-white/20 mt-1">
              No one in your department needs cover right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableSwaps.map((swap) => (
              <div
                key={swap.id}
                className="glass rounded-2xl p-5 border border-gold/15 bg-gold/3 relative overflow-hidden group hover:border-gold/30 transition-all duration-300 scroll-item"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/8 blur-3xl rounded-full -z-10 group-hover:bg-gold/15 transition-colors duration-500" />

                {/* Requester */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-black border border-gold/20 shrink-0">
                    {swap.requester?.full_name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">
                      {swap.requester?.full_name ?? "A teammate"}{" "}
                      <span className="text-white/40 font-medium">needs cover</span>
                    </p>
                    {swap.reason && (
                      <p className="text-[11px] text-gold/50 font-medium italic mt-0.5">
                        &ldquo;{swap.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Shift details */}
                {swap.shift && (
                  <div className="p-4 rounded-2xl bg-[#050505]/50 border border-white/5 space-y-2.5 mb-4">
                    <p className="text-sm font-bold text-white">{swap.shift.title}</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatShiftDate(swap.shift.start_time)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                        <Clock className="w-3.5 h-3.5" />
                        {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}
                      </div>
                    </div>
                    {swap.shift.department && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: swap.shift.department.color || "#d4af37" }}
                        />
                        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                          {swap.shift.department.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <WorkerSwapActions swapId={swap.id} mode="offer" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
