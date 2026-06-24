import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddShiftDialog } from "@/components/shifts/AddShiftDialog";
import { Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ShiftsListClient } from "@/components/shifts/ShiftsListClient";
import { autoCloseExpiredShifts } from "@/lib/actions/shifts";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  not_started: "bg-white/10 text-white/50",
  started: "bg-blue-500/20 text-blue-400 shadow-blue-500/10",
  up_for_swap: "bg-purple-500/20 text-purple-400",
  pending_approval_claim: "bg-yellow-500/20 text-yellow-400",
  pending_approval_swap: "bg-yellow-500/20 text-yellow-400",
  swapped: "bg-emerald-500/10 text-emerald-400",
  overdue_not_done: "bg-orange-500/20 text-orange-400",
  done_pending_approval: "bg-yellow-500/20 text-yellow-400",
  done_manager_approved: "bg-emerald-500/20 text-emerald-400",
  done_rejected: "bg-red-500/20 text-red-400",
  no_show: "bg-red-500/20 text-red-400",
  cancelled: "bg-white/5 text-white/20",
};

export default async function ShiftsPage(props: {
  searchParams: Promise<{ dept?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  // Auto-close expired shifts
  await autoCloseExpiredShifts(orgId);

  const supabase = await createClient();

  let query = supabase
    .from("shifts")
    .select(`
      *,
      department:departments(*),
      profile:profiles!shifts_user_id_fkey(id, full_name)
    `)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  // Scope to department_id if manager (but only if they are a department manager)
  const isManager = profile?.user_role === "manager";
  const isAdmin = profile?.user_role === "admin";

  // Build list of departments this manager can access
  let managerDeptIds: string[] = [];
  if (isManager && profile?.manager_type === "department" && profile?.department_id) {
    // Department manager: can only see their assigned department
    managerDeptIds = [profile.department_id];
  }
  // If manager_type === 'general' or no assignment, managerDeptIds stays empty (means show all)

  // General managers see all shifts
  // Department managers see only their departments + General (null)
  if (isManager && managerDeptIds.length > 0) {
    const orConditions = managerDeptIds.map(id => `department_id.eq.${id}`).join(",");
    query = query.or(`${orConditions},department_id.is.null`);
  }
  // If manager has NO departments OR user is admin, show all shifts (no filtering)

  if (searchParams.dept) {
    if (!isManager || managerDeptIds.length === 0 || managerDeptIds.includes(searchParams.dept)) {
      query = query.eq("department_id", searchParams.dept);
    }
  }
  if (searchParams.status) query = query.eq("status", searchParams.status);

  // Filter departments for the AddShiftDialog and filtering
  let deptQuery = supabase.from("departments").select("*").eq("organization_id", orgId).order("sort_order");
  if (isManager && managerDeptIds.length > 0) {
    deptQuery = deptQuery.in("id", managerDeptIds);
  }

  const [departmentsRes, profilesRes, shiftsRes] = await Promise.all([
    deptQuery,
    supabase.from("profiles").select("id, full_name, department_id").eq("organization_id", orgId).eq("is_active", true).eq("user_role", "worker"),
    query
  ]);

  const departments = (departmentsRes.data ?? []) as any[];
  const profiles = (profilesRes.data ?? []) as any[];
  const rawShifts = shiftsRes.data;

  const now = new Date();

  const allShifts = ((rawShifts ?? []) as any[]).sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  // Separate active and ended shifts
  const shifts = allShifts.filter(s => new Date(s.end_time) >= now);
  const endedShifts = allShifts.filter(s => new Date(s.end_time) < now).reverse(); // Most recent first

  const canAddShift = isAdmin || isManager;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Team Shifts</h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
            Schedule Overview · <span className="text-gold/60">{shifts.length} Active Records</span>
          </p>
        </div>
        {canAddShift && (
          <div className="flex items-center gap-3">
             <AddShiftDialog departments={departments as any} profiles={profiles as any} orgId={orgId} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 md:gap-3 px-1 md:px-2">
        <Link href="/shifts">
          <Button
            variant="outline"
            className={cn(
              "glass rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 md:px-6 h-9 md:h-10 border-white/5",
              !searchParams.dept && !searchParams.status ? "bg-gold text-[#050505] border-gold" : "text-white/40 hover:text-white"
            )}
            size="sm"
          >
            All
          </Button>
        </Link>
        {departments.map((d) => (
          <Link key={d.id} href={`/shifts?dept=${d.id}`}>
            <Button
              variant="outline"
              className={cn(
               "glass rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 md:px-6 h-9 md:h-10 border-white/5",
                searchParams.dept === d.id ? "bg-gold text-[#050505] border-gold" : "text-white/40 hover:text-white"
              )}
              size="sm"
            >
              <div className="w-1.5 h-1.5 rounded-full mr-2 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: d.color }} />
              {d.name}
            </Button>
          </Link>
        ))}
        <Link href="/shifts?status=not_started">
          <Button
            variant="outline"
            className={cn(
              "glass rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 md:px-6 h-9 md:h-10 border-white/5",
              searchParams.status === "not_started" ? "bg-gold text-[#050505] border-gold" : "text-white/40 hover:text-white"
            )}
            size="sm"
          >
            Unassigned / Upcoming
          </Button>
        </Link>
      </div>

      {/* Active Shifts */}
      <ShiftsListClient
        shifts={shifts}
        canAddShift={canAddShift}
        departments={departments}
        profiles={profiles}
        orgId={orgId}
      />

      {/* Ended Shifts History */}
      {endedShifts.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-white/10">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Shift History
          </h2>
          <div className="space-y-2">
            {endedShifts.map((shift) => (
              <div
                key={shift.id}
                className="glass rounded-xl p-4 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all"
              >
                <div>
                  <h3 className="font-bold text-white">{shift.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-white/40">
                    {shift.department && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: shift.department.color }}
                        />
                        {shift.department.name}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatShiftDate(shift.start_time)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatShiftTime(shift.start_time, shift.end_time)}
                    </div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 whitespace-nowrap ml-4">
                  ✓ Ended
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
