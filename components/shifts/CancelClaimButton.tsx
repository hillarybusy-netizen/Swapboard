"use client";
import { useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { cancelShiftClaim } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";
import { catchError } from "@/lib/errors";

interface Props {
  shiftId: string;
  shiftTitle?: string;
}

export function CancelClaimButton({ shiftId, shiftTitle }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    try {
      await cancelShiftClaim(shiftId);
      toast({
        title: "Claim Cancelled",
        description: `Your claim for "${shiftTitle ?? "this shift"}" has been cancelled. It is now available for others.`,
        className: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
      });
      setShowModal(false);
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Red X cancel button */}
      <button
        onClick={() => setShowModal(true)}
        title="Cancel claim"
        className="
          w-8 h-8 rounded-full
          bg-red-500/10 border border-red-500/20
          text-red-400 flex items-center justify-center
          hover:bg-red-500/25 hover:border-red-500/40
          active:scale-95 transition-all duration-200
          shrink-0
        "
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="glass rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">Cancel Claim?</h3>
            <p className="text-sm text-white/50 text-center font-medium mb-6 leading-relaxed">
              Are you sure you want to cancel your claim for{" "}
              <span className="text-white/80 font-bold">"{shiftTitle ?? "this shift"}"</span>?
              It will become available for other workers immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="
                  flex-1 h-11 rounded-2xl
                  bg-white/5 border border-white/10
                  text-white/60 text-[11px] font-black uppercase tracking-widest
                  hover:bg-white/10 transition-all duration-200
                  disabled:opacity-50
                "
              >
                Keep Claim
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="
                  flex-1 h-11 rounded-2xl
                  bg-red-500/15 border border-red-500/30
                  text-red-400 text-[11px] font-black uppercase tracking-widest
                  hover:bg-red-500/25 hover:border-red-500/50
                  active:scale-95 transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                {loading ? "Cancelling..." : "Cancel Claim"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
