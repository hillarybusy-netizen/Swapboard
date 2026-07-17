"use client";

import { useState } from "react";
import { formatShiftDate, formatShiftTime, formatShiftDuration, cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Timer,
  ChevronRight,
  Sparkles,
  FileText,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShiftActionButton } from "@/components/shifts/ShiftActionButton";
import { CancelClaimButton } from "@/components/shifts/CancelClaimButton";
import { Badge } from "@/components/ui/badge";
import { ShiftTimingBadges } from "@/components/shifts/ShiftTimingBadges";

interface Props {
  upcomingShifts: any[];
  tz: string;
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

export function UpcomingShiftsList({ upcomingShifts, tz }: Props) {
  const [selectedShift, setSelectedShift] = useState<any | null>(null);

  return (
    <>
      <div className="space-y-2.5">
        {upcomingShifts.map((shift) => {
          const badge = shiftStatusBadge(shift.status);
          const activeSwap = shift.swap_requests?.find((sr: any) =>
            ["pending", "worker_accepted"].includes(sr.status)
          );

          return (
            <div
              key={shift.id}
              onClick={() => setSelectedShift(shift)}
              className="glass rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate group-hover:text-gold transition-colors">{shift.title}</p>
                    {activeSwap && (
                      <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5">
                        Swap Active
                      </Badge>
                    )}
                  </div>
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
                <div className="flex items-center gap-2">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0", badge.color)}>
                    {badge.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
              </div>
              <ShiftTimingBadges
                status={shift.status}
                startTime={shift.start_time}
                endTime={shift.end_time}
                lateStartedAt={shift.late_started_at}
                lateSubmittedAt={shift.late_submitted_at}
                className="mt-2"
              />
            </div>
          );
        })}
      </div>

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={(open) => { if (!open) setSelectedShift(null); }}>
        <DialogContent className="bg-[#0a0a0a]/95 border-white/10 text-white max-w-md rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {selectedShift && (() => {
            const badge = shiftStatusBadge(selectedShift.status);
            const activeSwap = selectedShift.swap_requests?.find((sr: any) =>
              ["pending", "worker_accepted"].includes(sr.status)
            );
            const canStartShift = selectedShift.status === "not_started";
            const canMarkDone = selectedShift.status === "started" || selectedShift.status === "overdue_not_done";
            const canPostSwap = selectedShift.status === "not_started" || selectedShift.status === "started";
            const isPendingClaim = selectedShift.status === "pending_approval_claim";

            return (
              <>
                <DialogHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    {selectedShift.department && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: selectedShift.department.color || "#d4af37" }}
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                          {selectedShift.department.name}
                        </span>
                      </div>
                    )}
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", badge.color)}>
                      {badge.label}
                    </span>
                  </div>
                  <ShiftTimingBadges
                    status={selectedShift.status}
                    startTime={selectedShift.start_time}
                    endTime={selectedShift.end_time}
                    lateStartedAt={selectedShift.late_started_at}
                    lateSubmittedAt={selectedShift.late_submitted_at}
                  />
                  <DialogTitle className="text-xl font-black tracking-tight text-left">
                    {selectedShift.title}
                  </DialogTitle>
                  <DialogDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest text-left">
                    Detailed Shift Information
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                  {/* Date & Time info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gold/80" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {formatShiftDate(selectedShift.start_time, tz)}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Date</p>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gold/80" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {formatShiftTime(selectedShift.start_time, selectedShift.end_time, tz)}
                        </p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">
                          {formatShiftDuration(selectedShift.start_time, selectedShift.end_time)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Swap request details block */}
                  {activeSwap && (
                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">
                          Active Swap Request
                        </span>
                        <span className="text-[9px] text-white/30">
                          {new Date(activeSwap.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-medium">
                        {activeSwap.status === "worker_accepted" ? (
                          <>
                            Cover offered by{" "}
                            <span className="font-bold text-white">
                              {activeSwap.covering_worker?.full_name}
                            </span>
                            . Awaiting manager approval.
                          </>
                        ) : (
                          "Open for coverage. Waiting for a teammate to accept."
                        )}
                      </p>
                      {activeSwap.reason && (
                        <p className="text-[11px] text-white/40 italic bg-white/[0.02] p-2 rounded-xl border border-white/5">
                          &ldquo;{activeSwap.reason}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Notes / Instructions */}
                  {selectedShift.notes && (
                    <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 border-dashed">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Notes & Instructions
                      </p>
                      <p className="text-xs text-white/60 font-medium leading-relaxed italic">
                        &ldquo;{selectedShift.notes}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions container */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  {isPendingClaim && (
                    <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                        Awaiting Manager
                      </span>
                      <CancelClaimButton shiftId={selectedShift.id} shiftTitle={selectedShift.title} />
                    </div>
                  )}

                  {!isPendingClaim && (canStartShift || canMarkDone || canPostSwap) && (
                    <div className="flex gap-2 w-full">
                      {(canStartShift || canMarkDone) && (
                        <div className="flex-1">
                          <ShiftActionButton
                            shiftId={selectedShift.id}
                            shiftTitle={selectedShift.title}
                            status={selectedShift.status}
                            startTime={selectedShift.start_time}
                            endTime={selectedShift.end_time}
                          />
                        </div>
                      )}
                      {canPostSwap && (
                        <Link
                          href={`/swap?post=${selectedShift.id}`}
                          onClick={() => setSelectedShift(null)}
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
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
