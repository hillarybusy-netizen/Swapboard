"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, MessageSquare } from "lucide-react";
import { managerSwapAction } from "@/lib/actions/swaps";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  swapId: string;
}

export function ApproveSwapButton({ swapId }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [showRejectNotes, setShowRejectNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [blockReswap, setBlockReswap] = useState(false);
  const router = useRouter();

  async function handleApprove() {
    setLoading("approve");
    try {
      await managerSwapAction(swapId, "approve");
      toast({
        title: "Swap Approved",
        description: "The shift has been transferred to the covering worker.",
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
      await managerSwapAction(swapId, "reject", notes || undefined, blockReswap);
      toast({
        title: "Swap Rejected",
        description: blockReswap
          ? "Swap rejected. Shift returned to original worker and locked."
          : "Swap rejected. Shift re-posted for swap.",
        className: "bg-red-500/20 border-red-500/50 text-red-400",
      });
      setShowRejectNotes(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={!!loading}
          className="
            flex items-center justify-center gap-1.5 flex-1
            h-8 px-3 rounded-xl
            bg-emerald-500/10 border border-emerald-500/20
            text-emerald-400 text-[9px] font-black uppercase tracking-widest
            hover:bg-emerald-500/20 hover:border-emerald-500/40
            active:scale-95 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading === "approve" ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>

        <button
          onClick={() => setShowRejectNotes(!showRejectNotes)}
          disabled={!!loading}
          className="
            flex items-center justify-center gap-1.5 flex-1
            h-8 px-3 rounded-xl
            bg-red-500/10 border border-red-500/20
            text-red-400 text-[9px] font-black uppercase tracking-widest
            hover:bg-red-500/20 hover:border-red-500/40
            active:scale-95 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <XCircle className="w-3 h-3" />
          Reject
        </button>
      </div>

      {showRejectNotes && (
        <div className="space-y-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional rejection notes…"
            rows={2}
            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:border-gold/30 resize-none"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={blockReswap}
              onChange={(e) => setBlockReswap(e.target.checked)}
              className="accent-gold"
            />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
              Block re-swap (return to original worker)
            </span>
          </label>
          <button
            onClick={handleReject}
            disabled={!!loading}
            className="w-full h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading === "reject" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <XCircle className="w-3 h-3" />
            )}
            {loading === "reject" ? "Rejecting…" : "Confirm Rejection"}
          </button>
        </div>
      )}
    </div>
  );
}
