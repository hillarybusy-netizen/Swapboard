import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddShiftDialog } from "@/components/shifts/AddShiftDialog";
import { Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";
import { ShiftsListClient } from "@/components/shifts/ShiftsListClient";

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

  const supabase = await createClient();

  let query = supabase
    .from("shifts")
    .select(`
      *,
      department:departments(*),
      profile:profiles!shifts_assigned_to_fkey(id, full_name)
    `)
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  // Scope to department_ids if manager
  const isManager = profile?.user_role === "manager";
  const isAdmin = profile?.user_role === "admin";
  const managerDeptIds = profile?.department_ids || [];

  if (isManager && managerDeptIds.length > 0) {
    query = query.in("department_id", managerDeptIds);
  } else if (isManager) {
    // If manager has no departments assigned, show nothing
    query = query.eq("department_id", "00000000-0000-0000-0000-000000000000");
  }

  if (searchParams.dept) {
    if (!isManager || managerDeptIds.includes(searchParams.dept)) {
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

  const shifts = ((rawShifts ?? []) as any[]).map(s => ({
    ...s,
    isEnded: new Date(s.end_time) < now
  })).sort((a, b) => {
    if (a.isEnded === b.isEnded) {
      if (a.isEnded) {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      }
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    }
    return a.isEnded ? 1 : -1;
  });

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

      {/* Shifts list */}
      <ShiftsListClient 
        shifts={shifts}
        canAddShift={canAddShift}
        departments={departments}
        profiles={profiles}
        orgId={orgId}
      />
    </div>
  );
}
