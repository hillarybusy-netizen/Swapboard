"use client";
import { catchError } from "@/lib/errors";

import { useState } from "react";
import { AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { markNoShow } from "@/lib/actions/shifts";
import { softDeleteShift } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  shiftId: string;
  shiftTitle: string;
  currentStatus: string;
}

export function ShiftManagerActions({ shiftId, shiftTitle, currentStatus }: Props) {
  const [loadingNoShow, setLoadingNoShow] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const router = useRouter();

  async function handleNoShow() {
    setLoadingNoShow(true);
    try {
      await markNoShow(shiftId, "Marked as no-show by manager");
      toast({
        title: "Marked as No-Show",
        description: `"${shiftTitle}" has been flagged as a no-show.`,
        className: "bg-red-500/10 border-red-500/20 text-red-400",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoadingNoShow(false);
    }
  }

  async function handleDelete() {
    setLoadingDelete(true);
    try {
      await softDeleteShift(shiftId);
      toast({
        title: "Shift Cancelled",
        description: `"${shiftTitle}" has been cancelled and removed.`,
        className: "bg-white/10 text-white/60",
      });
      router.push("/shifts");
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
      setLoadingDelete(false);
    }
  }

  return (
    <div className="space-y-3">
      {currentStatus === "overdue_not_done" && (
        <button
          onClick={handleNoShow}
          disabled={loadingNoShow}
          className="
            flex items-center justify-center gap-2 w-full
            h-10 px-5 rounded-xl
            bg-red-500/10 border border-red-500/20
            text-red-400 text-[10px] font-black uppercase tracking-widest
            hover:bg-red-500/20 hover:border-red-500/40
            active:scale-95 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loadingNoShow ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          {loadingNoShow ? "Processing..." : "Mark as No-Show"}
        </button>
      )}

      {/* Cancel / soft-delete */}
      {!showConfirmDelete ? (
        <button
          onClick={() => setShowConfirmDelete(true)}
          className="
            flex items-center justify-center gap-2 w-full
            h-10 px-5 rounded-xl
            bg-white/5 border border-white/10
            text-white/40 text-[10px] font-black uppercase tracking-widest
            hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400
            active:scale-95 transition-all duration-200
          "
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel This Shift
        </button>
      ) : (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-3">
          <p className="text-xs font-bold text-red-400">
            Are you sure? This will soft-delete the shift and notify the worker.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loadingDelete}
              className="flex-1 h-9 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingDelete ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {loadingDelete ? "Cancelling..." : "Yes, Cancel"}
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="flex-1 h-9 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
