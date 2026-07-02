"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { approveShiftClaim, rejectShiftClaim } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";

interface Props {
  shiftId: string;
  shiftTitle?: string;
  workerName?: string;
}

export function ApproveClaimButton({ shiftId, shiftTitle, workerName }: Props) {
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [loadingReject, setLoadingReject] = useState(false);

  async function handleApprove() {
    setLoadingApprove(true);
    try {
      await approveShiftClaim(shiftId);
      toast({
        title: "Claim Approved",
        description: `"${shiftTitle ?? "Shift"}" has been assigned to ${workerName ?? "the worker"}.`,
        className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
      });
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoadingApprove(false);
    }
  }

  async function handleReject() {
    setLoadingReject(true);
    try {
      await rejectShiftClaim(shiftId);
      toast({
        title: "Claim Rejected",
        description: `The claim for "${shiftTitle ?? "Shift"}" was rejected.`,
        className: "bg-red-500/20 border-red-500/50 text-red-400",
      });
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoadingReject(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loadingApprove || loadingReject}
        className="
          flex items-center justify-center gap-2 flex-1
          h-9 px-4 rounded-xl
          bg-emerald-500/10 border border-emerald-500/20
          text-emerald-400 text-[10px] font-black uppercase tracking-widest
          hover:bg-emerald-500/20 hover:border-emerald-500/40
          active:scale-95 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap
        "
      >
        {loadingApprove ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
        Approve
      </button>
      
      <button
        onClick={handleReject}
        disabled={loadingApprove || loadingReject}
        className="
          flex items-center justify-center gap-2 flex-1
          h-9 px-4 rounded-xl
          bg-red-500/10 border border-red-500/20
          text-red-400 text-[10px] font-black uppercase tracking-widest
          hover:bg-red-500/20 hover:border-red-500/40
          active:scale-95 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap
        "
      >
        {loadingReject ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
        Reject
      </button>
    </div>
  );
}
