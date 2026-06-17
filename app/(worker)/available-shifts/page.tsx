import { getCachedSession } from "@/lib/supabase/cached";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime } from "@/lib/utils";
import { Calendar, Clock, Search, Briefcase } from "lucide-react";
import { ClaimUnassignedShiftButton } from "@/components/shifts/ClaimUnassignedShiftButton";

export const dynamic = "force-dynamic";

export default async function AvailableShiftsPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const deptId = profile?.department_id;

  // Fetch unassigned shifts in the user's department
  let query = supabase
    .from("shifts")
    .select("*, department:departments(name, color)")
    .is("assigned_to", null)
    .eq("status", "not_started")
    .is("deleted_at", null)
    .order("start_time", { ascending: true });

  if (deptId) {
    query = query.eq("department_id", deptId);
  } else if (profile?.organization_id) {
    query = query.eq("organization_id", profile.organization_id);
  }

  const { data: availableRaw } = await query;
  const availableShifts = (availableRaw ?? []) as any[];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
          Available Shifts
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          Pick up extra hours · <span className="text-emerald-400/80">{availableShifts.length} Open</span>
        </p>
      </div>

      {availableShifts.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center border border-white/5 mt-8">
          <Search className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-sm font-bold text-white/30">No shifts available</p>
          <p className="text-[11px] text-white/20 mt-1">
            Check back later for open shifts in your department.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableShifts.map((shift) => (
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
                  {formatShiftDate(shift.start_time)}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest bg-[#050505]/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400/60" />
                  {formatShiftTime(shift.start_time, shift.end_time)}
                </div>
              </div>

              <ClaimUnassignedShiftButton shiftId={shift.id} shiftTitle={shift.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
