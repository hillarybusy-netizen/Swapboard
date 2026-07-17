import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration } from "@/lib/utils";
import { Calendar, Clock, Timer, ArrowLeftRight, CheckCircle2, AlertTriangle, Clock3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ShiftActionButton } from "@/components/shifts/ShiftActionButton";
import { CancelClaimButton } from "@/components/shifts/CancelClaimButton";
import { ShiftStatusSummary } from "@/components/shifts/ShiftStatusSummary";
import { ShiftTimingBadges } from "@/components/shifts/ShiftTimingBadges";
import { UpcomingShiftsList } from "@/components/shifts/UpcomingShiftsList";
import { autoCloseExpiredShifts } from "@/lib/actions/shifts";

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
      label: "Ongoing",
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
  const tz = profile?.timezone || "UTC";

  const params = await searchParams;
  const currentTab = (params.tab as TabKey) || "all";

  const supabase = await createClient();
  if (profile?.organization_id) await autoCloseExpiredShifts(profile.organization_id);

  const [
    { data: allShiftsData },
    { data: swappedAwayData },
    { data: departmentData },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select(`
        *,
        department:departments(*),
        swap_requests:swap_requests(
          id,
          status,
          reason,
          requested_at,
          requester:profiles!requester_id(id, full_name),
          covering_worker:profiles!covering_worker_id(id, full_name)
        )
      `)
      .eq("assigned_to", user.id)
      .is("deleted_at", null)
      .order("start_time", { ascending: false }),
    supabase
      .from("swap_requests")
      .select("*, shift:shifts(*, department:departments(*))")
      .eq("requester_id", user.id)
      .eq("status", "manager_approved"),
    profile?.department_id
      ? supabase
          .from("departments")
          .select("*")
          .eq("id", profile.department_id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  // Extract the shifts from approved swap requests where the user was the requester
  const swappedShifts = (swappedAwayData ?? [])
    .map((sr: any) => sr.shift)
    .filter(Boolean)
    .map((s: any) => ({ ...s, status: "swapped" }));

  // Combine currently assigned shifts with successfully swapped away shifts
  const allShifts = [
    ...(allShiftsData ?? []),
    ...swappedShifts,
  ].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const displayShifts = filterShifts(allShifts, currentTab);
  const department = departmentData as any;

  const upcomingCount = allShifts.filter((shift) =>
    ["not_started", "started", "up_for_swap", "pending_approval_claim", "pending_approval_swap"].includes(shift.status)
  ).length;
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
        {department && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: department.color || "#d4af37" }}
            />
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
              {department.name}
            </span>
          </div>
        )}
      </div>

      <ShiftStatusSummary shifts={allShifts} />

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
          <UpcomingShiftsList upcomingShifts={displayShifts} tz={tz} />
        )}
      </div>
    </div>
  );
}
