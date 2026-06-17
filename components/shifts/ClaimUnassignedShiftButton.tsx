"use client";

import { useTransition } from "react";
import { claimUnassignedShift } from "@/lib/actions/shifts";
import { Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClaimUnassignedShiftButton({ shiftId, shiftTitle }: { shiftId: string; shiftTitle: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleClaim = () => {
    startTransition(async () => {
      try {
        await claimUnassignedShift(shiftId);
        toast({
          title: "Claim Submitted",
          description: `You've requested to claim "${shiftTitle}". Awaiting manager approval.`,
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
      onClick={handleClaim}
      disabled={isPending}
      className="
        w-full h-12 flex items-center justify-center gap-2 rounded-xl
        bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
        hover:bg-emerald-500/20 hover:border-emerald-500/30
        active:scale-[0.98] transition-all duration-200 font-black uppercase tracking-widest text-[11px]
        disabled:opacity-50 disabled:pointer-events-none
      "
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Briefcase className="w-4 h-4" />
          Claim Shift
        </>
      )}
    </button>
  );
}
