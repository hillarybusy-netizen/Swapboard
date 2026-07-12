import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect, notFound } from "next/navigation";
import {
  formatShiftDate,
  formatShiftTime,
  formatShiftDuration,
  SHIFT_STATUS_LABELS,
  cn,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, ArrowLeft, User, FileText, Building2 } from "lucide-react";
import Link from "next/link";
import { ConfirmCompletionButton } from "@/components/shifts/ConfirmCompletionButton";
import { ApproveClaimButton } from "@/components/shifts/ApproveClaimButton";
import { ShiftManagerActions } from "@/components/shifts/ShiftManagerActions";
import { canManagerAccessDepartment } from "@/lib/managers";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  not_started: "bg-white/10 text-white/50",
  started: "bg-blue-500/20 text-blue-400",
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

export default async function ShiftDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  const [{ user, profile }, { data: shift }] = await Promise.all([
    getCachedSession(),
    supabase
      .from("shifts")
      .select(`
        *,
        department:departments(*),
        profile:profiles!assigned_to(id, full_name, email, phone),
        creator:profiles!created_by(id, full_name),
        swap_requests:swap_requests(
          id,
          status,
          reason,
          requested_at,
          requester:profiles!requester_id(id, full_name),
          covering_worker:profiles!covering_worker_id(id, full_name)
        )
      `)
      .eq("id", params.id)
      .single(),
  ]);

  if (!user) redirect("/login");
  if (!shift) notFound();

  const tz = profile?.timezone || "UTC";

  const isManagerOrAdmin =
    profile?.user_role === "manager" || profile?.user_role === "org_admin";
  const isOwner = shift.assigned_to === user.id;

  // Manager dept scope check — org_admins always have access;
  // managers are checked via canManagerAccessDepartment which respects manager_type
  const canAct =
    profile?.user_role === "org_admin" ||
    (profile?.user_role === "manager" &&
      canManagerAccessDepartment(profile as any, shift.department_id));

  const dept = shift.department as any;
  const assignee = shift.profile as any;
  const creator = shift.creator as any;

  return (
    <div className="max-w-3xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Back link */}
      <Link
        href="/shifts"
        className="group flex items-center gap-2 text-white/40 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Shifts
      </Link>

      {/* Main card */}
      <div className="glass rounded-[3rem] p-8 md:p-10 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -z-10" />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div className="space-y-3">
            {dept && (
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dept.color }}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  {dept.name}
                </span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {shift.title}
            </h1>
          </div>
          <Badge
            className={cn(
              "rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest border-none shadow-xl shrink-0 h-fit",
              STATUS_BADGE[shift.status] ?? "bg-white/10 text-white/50"
            )}
          >
            {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
          </Badge>
        </div>

        {/* Time/date grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold/60">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-white">
                {formatShiftDate(shift.start_time, tz)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                Date
              </p>
            </div>
          </div>
          <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold/60">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-white">
                {formatShiftTime(shift.start_time, shift.end_time, tz)}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                {formatShiftDuration(shift.start_time, shift.end_time)}
              </p>
            </div>
          </div>
        </div>

        {/* Actual Time grid */}
        {(shift.actual_start_time || shift.actual_end_time) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {shift.actual_start_time && (
              <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-blue-500/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    {formatShiftTime(shift.actual_start_time, shift.actual_start_time, tz)}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/50">
                    Actual Start
                  </p>
                </div>
              </div>
            )}
            {shift.actual_end_time && (
              <div className="p-5 rounded-[1.5rem] bg-white/[0.02] border border-emerald-500/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    {formatShiftTime(shift.actual_end_time, shift.actual_end_time, tz)}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/50">
                    Actual End
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assigned worker */}
        <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 mb-6">
          <Avatar className="w-12 h-12 rounded-full border-2 border-white/10 ring-4 ring-white/[0.02]">
            <AvatarFallback className="bg-gold/10 text-gold text-lg font-black italic">
              {assignee?.full_name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-white">
              {assignee?.full_name ?? (
                <span className="text-yellow-400">Unassigned</span>
              )}
            </p>
            {assignee?.email && (
              <p className="text-[10px] font-medium text-white/30 truncate">
                {assignee.email}
              </p>
            )}
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              Assigned Worker
            </p>
          </div>

        </div>

        {/* Swap Request Details */}
        {(() => {
          const activeSwap = shift.swap_requests?.find((sr: any) =>
            ["pending", "worker_accepted"].includes(sr.status)
          );
          if (!activeSwap) return null;
          return (
            <div className="p-6 rounded-[1.5rem] bg-purple-500/5 border border-purple-500/15 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  Active Swap Request
                </p>
                <span className="text-[10px] text-white/30">
                  {new Date(activeSwap.requested_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-white/60 font-medium">
                {activeSwap.status === "worker_accepted" ? (
                  <>
                    Cover offered by{" "}
                    <span className="font-bold text-white">
                      {activeSwap.covering_worker?.full_name}
                    </span>
                    . Awaiting manager approval.
                  </>
                ) : (
                  "Open for coverage. No offers yet."
                )}
              </p>
              {activeSwap.reason && (
                <p className="text-xs text-white/40 italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  "Reason: {activeSwap.reason}"
                </p>
              )}
            </div>
          );
        })()}

        {/* Notes */}
        {shift.notes && (
          <div className="p-6 rounded-[1.5rem] bg-white/[0.01] border border-white/5 border-dashed mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Notes & Instructions
            </p>
            <p className="text-sm text-white/60 font-medium leading-relaxed italic">
              &ldquo;{shift.notes}&rdquo;
            </p>
          </div>
        )}

        {/* Creator */}
        {creator && (
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/15 mb-8">
            Created by {creator.full_name}
          </p>
        )}
      </div>

      {/* Manager action panel */}
      {canAct && (
        <div className="card-premium rounded-[2.5rem] p-8 space-y-6">
          <div>
            <h2 className="text-lg font-black text-white mb-1">
              Manager Actions
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
              Take action on this shift
            </p>
          </div>

          {shift.status === "pending_approval_claim" && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                Worker claimed this shift — approve or reject
              </p>
              <ApproveClaimButton
                shiftId={shift.id}
                shiftTitle={shift.title}
                workerName={assignee?.full_name}
              />
            </div>
          )}

          {shift.status === "done_pending_approval" && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                Worker marked this shift as done
              </p>
              <ConfirmCompletionButton
                shiftId={shift.id}
                shiftTitle={shift.title}
                workerName={assignee?.full_name}
              />
            </div>
          )}

          {(shift.status === "started" || shift.status === "overdue_not_done" || shift.status === "not_started") && (
            <ShiftManagerActions
              shiftId={shift.id}
              shiftTitle={shift.title}
              currentStatus={shift.status}
            />
          )}

          {!["pending_approval_claim", "done_pending_approval", "started", "overdue_not_done", "not_started"].includes(shift.status) && (
            <p className="text-sm text-white/30 italic">
              No actions available for this shift in its current state ({SHIFT_STATUS_LABELS[shift.status] ?? shift.status}).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
