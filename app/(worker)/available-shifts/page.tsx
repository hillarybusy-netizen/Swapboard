import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime } from "@/lib/utils";
import { Calendar, Clock, Search, Briefcase, ArrowLeftRight } from "lucide-react";
import { ClaimUnassignedShiftButton } from "@/components/shifts/ClaimUnassignedShiftButton";
import { ClaimSwapShiftButton } from "@/components/shifts/ClaimSwapShiftButton";

export const dynamic = "force-dynamic";

export default async function AvailableShiftsPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const deptId = profile?.department_id;
  const orgId = profile?.organization_id;
  const tz = profile?.timezone || "UTC";

  // Fetch unassigned shifts in user's department + General department
  let unassignedQuery = supabase
    .from("shifts")
    .select("*, department:departments(name, color)")
    .is("assigned_to", null)
    .eq("status", "not_started")
    .is("deleted_at", null)
    .eq("organization_id", orgId)
    .order("start_time", { ascending: true });

  // Get General department ID if it exists
  const { data: generalDept } = await supabase
    .from("departments")
    .select("id")
    .eq("organization_id", orgId)
    .ilike("name", "general")
    .maybeSingle();

  const generalDeptId = generalDept?.id;

  // Filter for worker's department OR General department
  if (deptId) {
    let orQuery = `department_id.eq.${deptId},department_id.is.null`;
    if (generalDeptId) orQuery += `,department_id.eq.${generalDeptId}`;
    unassignedQuery = unassignedQuery.or(orQuery);
  } else {
    // If worker has no department, they can only see general shifts
    let orQuery = `department_id.is.null`;
    if (generalDeptId) orQuery += `,department_id.eq.${generalDeptId}`;
    unassignedQuery = unassignedQuery.or(orQuery);
  }

  // Fetch swaps available for this worker (up_for_swap status)
  // Only show swaps where the worker is NOT the requester
  let swapQuery = supabase
    .from("swap_requests")
    .select(
      "*, shift:shifts(id, title, start_time, end_time, department_id, organization_id, department:departments(name, color)), requester:profiles!requester_id(full_name)"
    )
    .eq("status", "pending")
    .is("covering_worker_id", null)
    .neq("requester_id", user.id);

  if (deptId) {
    // This filter happens in post-processing since we need to join the shift
    // We'll filter after fetching
  }

  const [{ data: unassignedRaw }, { data: swapsRaw }] = await Promise.all([
    unassignedQuery,
    swapQuery,
  ]);

  const unassignedShifts = (unassignedRaw ?? []) as any[];

  // Filter swaps to only those in the user's department or General department
  const availableSwaps = (swapsRaw ?? [])
    .filter((swap) => {
      if (!deptId || !swap.shift?.department_id) return true; // General shifts have no department
      if (generalDeptId && swap.shift.department_id === generalDeptId) return true; // Explicit General department
      const isInUserDept = swap.shift.department_id === deptId;
      return isInUserDept;
    })
    .map((swap) => ({
      ...swap,
      isSwap: true,
      shift: {
        ...swap.shift,
        requester: swap.requester,
      },
    }));

  const totalAvailable = unassignedShifts.length + availableSwaps.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
          Available Shifts
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Pick up extra hours · <span className="text-emerald-400/80">{totalAvailable} Available</span>
        </p>
      </div>

      {totalAvailable === 0 ? (
        <div className="glass rounded-2xl p-8 text-center border border-white/5 mt-8">
          <Search className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-sm font-bold text-white/30">No shifts available</p>
          <p className="text-[11px] text-white/20 mt-1">
            Check back later for open shifts in your department.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unassigned Shifts Section */}
          {unassignedShifts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider px-1">
                Open Shifts ({unassignedShifts.length})
              </h2>
              {unassignedShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="glass rounded-2xl p-5 border border-emerald-500/15 bg-emerald-500/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 scroll-item"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -z-10 group-hover:bg-emerald-500/10 transition-colors duration-500" />

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-white leading-tight">
                        {shift.title}
                      </h3>
                      {shift.department && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: shift.department.color || "#10b981" }}
                          />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {shift.department.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest bg-[#050505]/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400/60" />
                      {formatShiftDate(shift.start_time, tz)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest bg-[#050505]/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400/60" />
                      {formatShiftTime(shift.start_time, shift.end_time, tz)}
                    </div>
                  </div>

                  <ClaimUnassignedShiftButton shiftId={shift.id} shiftTitle={shift.title} />
                </div>
              ))}
            </div>
          )}

          {/* Available for Swap Section */}
          {availableSwaps.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider px-1">
                Available for Swap ({availableSwaps.length})
              </h2>
              {availableSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className="glass rounded-2xl p-5 border border-purple-500/15 bg-purple-500/5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 scroll-item"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -z-10 group-hover:bg-purple-500/10 transition-colors duration-500" />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white leading-tight">
                          {swap.shift?.title}
                        </h3>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                          <ArrowLeftRight className="w-3 h-3 text-purple-400" />
                          <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest">
                            Swap Available
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/40 font-medium mt-1">
                        From: <span className="text-white/60">{swap.shift?.requester?.full_name}</span>
                      </p>
                      {swap.shift?.department && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: swap.shift.department.color || "#a855f7" }}
                          />
                          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            {swap.shift.department.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                      <ArrowLeftRight className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest bg-[#050505]/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400/60" />
                      {formatShiftDate(swap.shift?.start_time, tz)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest bg-[#050505]/40 px-3 py-1.5 rounded-lg border border-white/5">
                      <Clock className="w-3.5 h-3.5 text-purple-400/60" />
                      {formatShiftTime(swap.shift?.start_time, swap.shift?.end_time, tz)}
                    </div>
                  </div>

                  <ClaimSwapShiftButton swapId={swap.id} swapTitle={swap.shift?.title} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
