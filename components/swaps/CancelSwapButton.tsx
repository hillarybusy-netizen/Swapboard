"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSwapRequest } from "@/lib/actions/swaps";
import { toast } from "@/hooks/use-toast";
import { X, Loader2 } from "lucide-react";

interface Props {
  swapId: string;
}

export function CancelSwapButton({ swapId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this swap request?")) return;
    setLoading(true);
    try {
      await cancelSwapRequest(swapId);
      toast({ title: "Swap cancelled", description: "Your shift has been returned to scheduled." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="
        flex items-center justify-center gap-2
        h-9 px-4 rounded-xl
        bg-red-500/10 border border-red-500/20
        text-red-400 text-[10px] font-black uppercase tracking-widest
        hover:bg-red-500/20 hover:border-red-500/40
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <X className="w-3.5 h-3.5" />
      )}
      {loading ? "Cancelling…" : "Cancel"}
    </button>
  );
}
