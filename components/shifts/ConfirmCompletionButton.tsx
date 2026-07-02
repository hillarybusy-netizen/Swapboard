"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  approveShiftCompletion,
  rejectShiftCompletion,
  markNoShow,
} from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  shiftId: string;
  workerName?: string;
  shiftTitle?: string;
  showReject?: boolean;
}

export function ConfirmCompletionButton({
  shiftId,
  workerName,
  shiftTitle,
  showReject = false,
}: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | "noshow" | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter();

  async function handleApprove() {
    setLoading("approve");
    try {
      await approveShiftCompletion(shiftId);
      toast({
        title: "Shift Confirmed",
        description: `"${shiftTitle ?? "Shift"}" marked as completed for ${workerName ?? "worker"}.`,
        className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    try {
      await rejectShiftCompletion(shiftId, notes || undefined);
      toast({
        title: "Completion Rejected",
        description: `The completion for "${shiftTitle ?? "Shift"}" was rejected.`,
        className: "bg-red-500/20 border-red-500/50 text-red-400",
      });
      setShowNotes(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={!!loading}
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
          {loading === "approve" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          {loading === "approve" ? "Confirming…" : "Approve"}
        </button>

        {showReject && (
          <button
            onClick={() => setShowNotes(!showNotes)}
            disabled={!!loading}
            className="
              flex items-center justify-center gap-2
              h-9 px-4 rounded-xl
              bg-red-500/10 border border-red-500/20
              text-red-400 text-[10px] font-black uppercase tracking-widest
              hover:bg-red-500/20 hover:border-red-500/40
              active:scale-95 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap
            "
          >
            <XCircle className="w-3 h-3" />
            Reject
          </button>
        )}
      </div>

      {showNotes && (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional rejection reason…"
            rows={2}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/30 resize-none"
          />
          <button
            onClick={handleReject}
            disabled={!!loading}
            className="w-full h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            {loading === "reject" ? "Rejecting…" : "Confirm Rejection"}
          </button>
        </div>
      )}
    </div>
  );
}
