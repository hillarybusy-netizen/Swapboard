"use client";

import { useTransition } from "react";
import { offerToCoverSwap } from "@/lib/actions/swaps";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClaimSwapShiftButton({ swapId, swapTitle }: { swapId: string; swapTitle: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClaimSwap = () => {
    startTransition(async () => {
      try {
        await offerToCoverSwap(swapId);
        toast({
          title: "Swap Request Submitted",
          description: `You've offered to cover "${swapTitle}". Awaiting manager approval.`,
        });
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Action failed",
          description: error.message,
        });
      }
    });
  };

  return (
    <button
      onClick={handleClaimSwap}
      disabled={isPending}
      className="
        w-full h-12 flex items-center justify-center gap-2 rounded-xl
        bg-purple-500/10 border border-purple-500/20 text-purple-400
        hover:bg-purple-500/20 hover:border-purple-500/30
        active:scale-[0.98] transition-all duration-200 font-black uppercase tracking-widest text-[11px]
        disabled:opacity-50 disabled:pointer-events-none
      "
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <ArrowLeftRight className="w-4 h-4" />
          Offer to Cover
        </>
      )}
    </button>
  );
}
