"use client";
import { catchError } from "@/lib/errors";

import { useState } from "react";
import Link from "next/link";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, Trash2, Loader2, CheckSquare, Square } from "lucide-react";
import { AddShiftDialog } from "@/components/shifts/AddShiftDialog";
import { bulkSoftDeleteShifts } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

interface Props {
  shifts: any[];
  canAddShift: boolean;
  departments: any[];
  profiles: any[];
  orgId: string;
  timezone?: string;
}

export function ShiftsListClient({ shifts, canAddShift, departments, profiles, orgId, timezone }: Props) {
  const tz = timezone || (typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isSelectionMode = selectedIds.size > 0;

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function toggleSelectAll() {
    if (selectedIds.size === shifts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(shifts.map(s => s.id)));
    }
  }

  async function handleBulkDelete() {
    setLoading(true);
    try {
      const { count } = await bulkSoftDeleteShifts(Array.from(selectedIds));
      toast({
        title: "Shifts Deleted",
        description: `Successfully deleted ${count} shift(s).`,
      });
      setSelectedIds(new Set());
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (shifts.length === 0) {
    return (
      <div className="px-2">
        <div className="glass rounded-[2.5rem] p-20 text-center border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Calendar className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest tracking-tighter">No Shifts Found</h3>
          <p className="text-sm text-white/30 font-medium mb-10 max-w-xs mx-auto">Create your first shift to start coordinating your team.</p>
          {canAddShift && <AddShiftDialog departments={departments as any} profiles={profiles as any} orgId={orgId} timezone={tz} />}
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      <div className="flex justify-between items-center px-1 md:px-2 mb-4">
        <button
          onClick={toggleSelectAll}
          className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          {selectedIds.size === shifts.length ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4" />}
          Select All
        </button>
      </div>

      <div className="grid gap-4 px-1 md:px-2">
        {shifts.map((shift) => {
          const isSelected = selectedIds.has(shift.id);

          return (
            <Link key={shift.id} href={`/shifts/${shift.id}`} className={cn("group scroll-item relative")}>
              <div className={cn(
                "glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-white/5 glass-item-transition relative overflow-hidden transition-all duration-300",
                isSelected ? "border-gold/50 bg-gold/[0.05] ring-1 ring-gold/20" : "hover:border-gold/30 hover:bg-gold/[0.02]"
              )}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl group-hover:bg-gold/[0.03] -z-10 transition-colors" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex flex-1 items-center gap-4 md:gap-6 min-w-0">
                    
                    {/* Checkbox */}
                    <div 
                      className="shrink-0 flex items-center justify-center p-2 -ml-2 cursor-pointer z-10"
                      onClick={(e) => toggleSelect(shift.id, e)}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-gold transition-transform duration-200 scale-110" />
                      ) : (
                        <Square className="w-5 h-5 text-white/20 hover:text-white/40 transition-colors" />
                      )}
                    </div>

                    {shift.department && (
                      <div className="w-1.5 h-10 md:h-12 rounded-full shrink-0 shadow-[0_0_12px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-y-110" style={{ backgroundColor: shift.department.color }} />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 flex-wrap">
                        <h3 className="text-base md:text-lg font-black tracking-tight text-white truncate">{shift.title}</h3>
                        {shift.department && (
                          <Badge className="bg-white/5 text-white/30 rounded-full px-2.5 py-0.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest border-none">
                            {shift.department.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 md:gap-6 text-[10px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.1em] flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gold/60" />
                          {formatShiftDate(shift.start_time, tz)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gold/60" />
                          {formatShiftTime(shift.start_time, shift.end_time, tz)} <span className="text-white/10 ml-1 hidden sm:inline">· {formatShiftDuration(shift.start_time, shift.end_time)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-8 shrink-0 border-t border-white/5 sm:border-none pt-4 sm:pt-0">
                    <div className="flex flex-col items-start sm:items-end gap-1.5">
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/20">Assigned To</span>
                      {shift.profile ? (
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full ring-2 ring-white/5 bg-gold/10 flex items-center justify-center text-gold text-[10px] md:text-xs font-black">
                             {shift.profile.full_name?.charAt(0) ?? "?"}
                          </div>
                          <span className="text-[11px] md:text-xs font-bold text-white/80">{shift.profile.full_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                          <Users className="w-2.5 h-2.5 text-yellow-400" />
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-yellow-400">Unassigned</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/20">Status</span>
                      <Badge className={cn(
                        "rounded-full px-3 md:px-4 py-1 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none shadow-lg",
                        STATUS_BADGE[shift.status] || "bg-white/10 text-white/50"
                      )}>
                        {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Swap Details Block */}
                {(() => {
                  const activeSwap = shift.swap_requests?.find((sr: any) =>
                    ["pending", "worker_accepted"].includes(sr.status)
                  );
                  if (!activeSwap) return null;
                  return (
                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 relative z-10">
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
                          "Open for coverage. No offers yet."
                        )}
                      </p>
                      {activeSwap.reason && (
                        <p className="text-[11px] text-white/40 italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5 max-w-xl">
                          "{activeSwap.reason}"
                        </p>
                      )}
                    </div>
                  );
                })()}

              </div>
            </Link>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="glass card-premium rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl shadow-red-500/10 border-red-500/20 bg-[#0a0a0a]/90 backdrop-blur-xl">
            <span className="text-xs font-black uppercase tracking-widest text-white">
              {selectedIds.size} Selected
            </span>
            <div className="w-px h-6 bg-white/10" />
            <Button
              onClick={handleBulkDelete}
              disabled={loading}
              variant="destructive"
              size="sm"
              className="rounded-full px-6 gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              {loading ? "Deleting..." : "Delete Selected"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
