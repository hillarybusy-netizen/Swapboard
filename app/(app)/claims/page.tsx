import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime } from "@/lib/utils";
import { UserPlus, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { ApproveClaimButton } from "@/components/shifts/ApproveClaimButton";
import { canManagerAccessDepartment } from "@/lib/managers";

export const dynamic = "force-dynamic";

export default async function ClaimsPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  if (profile?.user_role === "worker") redirect("/my-shifts");

  const supabase = await createClient();
  const orgId = profile?.organization_id ?? "";
  const tz = profile?.timezone || "UTC";

  let query = supabase
    .from("shifts")
    .select(
      "*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(id, full_name, department_id)"
    )
    .eq("organization_id", orgId)
    .eq("status", "pending_approval_claim")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Department managers only see their departments + General (null dept)
  const isManager = profile?.user_role === "manager";
  if (isManager && profile?.manager_type === "department" && profile?.department_id) {
    query = query.or(
      `department_id.eq.${profile.department_id},department_id.is.null`
    );
  }

  const { data: rawClaims } = await query;
  const claims = (rawClaims ?? []) as any[];

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            Shift Claims
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Awaiting Approval ·{" "}
            <span className="text-blue-400/80">{claims.length} Pending</span>
          </p>
        </div>
      </div>

      {claims.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/5">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-white/15" />
          </div>
          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest">
            All Clear
          </h3>
          <p className="text-sm text-white/30 font-medium">
            No shift claims waiting for approval right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-1">
          {claims.map((shift: any) => (
            <div
              key={shift.id}
              className="glass rounded-2xl p-6 border border-blue-500/15 bg-blue-500/[0.03] relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 scroll-item"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -z-10 group-hover:bg-blue-500/10 transition-colors duration-500" />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                {/* Shift info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="text-base font-bold text-white">{shift.title}</h3>
                    {shift.department && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: shift.department.color || "#3b82f6" }}
                        />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                          {shift.department.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                      <Calendar className="w-3.5 h-3.5 text-blue-400/60" />
                      {formatShiftDate(shift.start_time, tz)}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                      <Clock className="w-3.5 h-3.5 text-blue-400/60" />
                      {formatShiftTime(shift.start_time, shift.end_time, tz)}
                    </span>
                  </div>
                </div>

                {/* Worker info */}
                {shift.profile && (
                  <div className="flex items-center gap-3 shrink-0 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm font-black border border-blue-500/20">
                      {shift.profile.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{shift.profile.full_name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <UserPlus className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest">
                          Claiming this shift
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <ApproveClaimButton
                shiftId={shift.id}
                shiftTitle={shift.title}
                workerName={shift.profile?.full_name}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
