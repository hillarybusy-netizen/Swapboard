import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime } from "@/lib/utils";
import {
  ArrowLeftRight,
  Calendar,
  Clock,
  Zap,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// --- Profile completion logic (8 fields) ---
function calcProfileCompletion(profile: any): {
  pct: number;
  missing: string[];
  filled: string[];
} {
  const checks: { label: string; done: boolean }[] = [
    { label: "Full name", done: !!profile?.full_name },
    { label: "Profile photo", done: !!profile?.avatar_url },
    { label: "Phone number", done: !!profile?.phone },
    { label: "Personal email", done: !!profile?.personal_email },
    { label: "Emergency contact name", done: !!profile?.emergency_contact_name },
    { label: "Emergency contact phone", done: !!profile?.emergency_contact_phone },
    {
      label: "Notification preferences",
      done:
        !!profile?.notification_preferences &&
        typeof profile.notification_preferences === "object" &&
        Object.keys(profile.notification_preferences).length > 0,
    },
  ];

  const filled = checks.filter((c) => c.done).map((c) => c.label);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);
  const pct = Math.round((filled.length / checks.length) * 100);

  return { pct, missing, filled };
}

function shiftStatusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    not_started: { label: "Upcoming", color: "text-white/50 bg-white/10" },
    started: { label: "In Progress", color: "text-blue-400 bg-blue-500/15 shadow-[0_0_12px_rgba(59,130,246,0.2)]" },
    up_for_swap: { label: "Up for Swap", color: "text-purple-400 bg-purple-500/15" },
    pending_approval_claim: { label: "Claim Pending", color: "text-yellow-400 bg-yellow-500/10" },
    pending_approval_swap: { label: "Swap Pending", color: "text-yellow-400 bg-yellow-500/10" },
    swapped: { label: "Swapped", color: "text-white/30 bg-white/5" },
    overdue_not_done: { label: "Overdue", color: "text-orange-400 bg-orange-500/15" },
    done_pending_approval: { label: "Awaiting Approval", color: "text-yellow-400 bg-yellow-500/10" },
    done_manager_approved: { label: "Completed ✓", color: "text-emerald-400 bg-emerald-500/15" },
    done_rejected: { label: "Rejected", color: "text-red-400 bg-red-500/15" },
    no_show: { label: "No-Show", color: "text-red-400 bg-red-500/15" },
    cancelled: { label: "Cancelled", color: "text-white/20 bg-white/5" },
  };
  return map[status] ?? { label: status, color: "text-white/40 bg-white/5" };
}

export default async function HomePage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const now = new Date().toISOString();
  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const orgName = (profile as any)?.organization?.name || "your team";
  const tz = profile?.timezone || "UTC";

  const { pct: profilePct, missing: profileMissing } = calcProfileCompletion(profile);

  // Fetch upcoming shifts (next 3, assigned, not cancelled/done)
  const { data: upcomingData } = await supabase
    .from("shifts")
    .select("*, department:departments(*)")
    .eq("assigned_to", user.id)
    .is("deleted_at", null)
    .not("status", "in", '("cancelled","done_manager_approved","swapped")')
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(3);

  const upcomingShifts = (upcomingData ?? []) as any[];

  // Fetch pending swap requests involving the user (as requester or covering_worker)
  const { data: mySwapData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(title, start_time, end_time), covering_worker:profiles!covering_worker_id(full_name)")
    .eq("requester_id", user.id)
    .in("status", ["pending", "worker_accepted"])
    .order("requested_at", { ascending: false })
    .limit(5);

  const pendingSwaps = (mySwapData ?? []) as any[];

  // Count available swaps in org (for quick stat)
  const { count: availCount } = await supabase
    .from("swap_requests")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", profile?.organization_id ?? "")
    .eq("status", "pending")
    .neq("requester_id", user.id);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold/50">
          {orgName}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-white/40 font-medium">
          Here&apos;s what&apos;s happening with your shifts today.
        </p>
      </div>

      {/* Profile Completion Card */}
      {profilePct < 100 && (
        <Link href="/my-profile" className="block">
          <div className="glass rounded-2xl p-5 border border-gold/20 relative overflow-hidden group hover:border-gold/40 transition-all duration-300">
            <div className="absolute right-0 top-0 w-40 h-40 bg-gold/5 blur-3xl group-hover:bg-gold/10 transition-all rounded-full" />
            <div className="flex items-start justify-between mb-3 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span className="text-xs font-black text-gold uppercase tracking-widest">
                    Complete Your Profile
                  </span>
                </div>
                <p className="text-[11px] text-white/40 font-medium">
                  {profileMissing.length > 0
                    ? `Missing: ${profileMissing.slice(0, 2).join(", ")}${profileMissing.length > 2 ? ` +${profileMissing.length - 2} more` : ""}`
                    : "All done!"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gold">{profilePct}%</span>
                <ChevronRight className="w-4 h-4 text-gold/40" />
              </div>
            </div>
            {/* Segmented progress */}
            <div className="flex gap-1 relative z-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    i < Math.round((profilePct / 100) * 8)
                      ? "bg-gold"
                      : "bg-white/10"
                  )}
                />
              ))}
            </div>
          </div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/swap"
          className="
            btn-gold rounded-2xl p-5 flex flex-col items-center justify-center gap-3
            text-center group hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200
          "
        >
          <div className="w-10 h-10 rounded-xl bg-[#050505]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-5 h-5 text-[#050505]" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-black text-[#050505] uppercase tracking-widest leading-tight">
            Post Shift for Swap
          </span>
        </Link>

        <Link
          href="/available-shifts"
          className="
            glass rounded-2xl p-5 flex flex-col items-center justify-center gap-3
            border border-white/10 text-center group
            hover:bg-white/5 hover:border-gold/30 hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200
          "
        >
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-gold" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <span className="block text-[11px] font-black text-gold uppercase tracking-widest leading-tight">
              Available Shifts
            </span>
          </div>
        </Link>
      </div>

      {/* Upcoming Shifts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Upcoming Shifts
          </h2>
          <Link
            href="/my-shifts"
            className="text-[10px] font-bold text-gold/60 hover:text-gold transition-colors flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {upcomingShifts.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-white/5">
            <Calendar className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-bold text-white/30">No upcoming shifts</p>
            <p className="text-[11px] text-white/20 mt-1">Check the swap board for available shifts</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingShifts.map((shift) => {
              const badge = shiftStatusBadge(shift.status);
              return (
                <div
                  key={shift.id}
                  className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{shift.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                          <Calendar className="w-3 h-3" />
                          {formatShiftDate(shift.start_time, tz)}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                          <Clock className="w-3 h-3" />
                          {formatShiftTime(shift.start_time, shift.end_time, tz)}
                        </span>
                      </div>
                      {shift.department && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: shift.department.color || "#d4af37" }}
                          />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {shift.department.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0", badge.color)}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Swap Requests Feed */}
      {pendingSwaps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Bell className="w-3.5 h-3.5 text-gold/60" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              Swap Activity
            </h2>
          </div>
          <div className="space-y-2">
            {pendingSwaps.map((swap) => (
              <div
                key={swap.id}
                className="glass rounded-2xl p-4 border border-gold/10 bg-gold/3 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                  {swap.status === "worker_accepted" ? (
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gold/60" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white leading-tight">
                    {swap.shift?.title ?? "Your shift"}
                  </p>
                  <p className="text-[11px] text-white/40 font-medium mt-0.5">
                    {swap.status === "pending" && "Awaiting someone to claim your swap"}
                    {swap.status === "worker_accepted" &&
                      `${swap.covering_worker?.full_name || "Someone"} offered to cover — awaiting manager`}
                  </p>
                  {swap.shift?.start_time && (
                    <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest mt-1">
                      {formatShiftDate(swap.shift.start_time, tz)} · {formatShiftTime(swap.shift.start_time, swap.shift.end_time, tz)}
                    </p>
                  )}
                </div>
                <Link
                  href="/swap"
                  className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
