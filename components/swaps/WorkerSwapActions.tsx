"use client";
import { catchError } from "@/lib/errors";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { offerToCoverSwap } from "@/lib/actions/swaps";
import { toast } from "@/hooks/use-toast";
import { UserCheck, Loader2 } from "lucide-react";

interface Props {
  swapId: string;
  mode: "offer" | "cancel";
  startTime?: string;
  endTime?: string;
}

export function WorkerSwapActions({ swapId, mode, startTime, endTime }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPastMidpoint, setIsPastMidpoint] = useState(false);

  useEffect(() => {
    if (!startTime || !endTime) return;
    const updateCutoff = () => {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      setIsPastMidpoint(Date.now() >= start + (end - start) / 2);
    };
    updateCutoff();
    const timer = window.setInterval(updateCutoff, 30_000);
    return () => window.clearInterval(timer);
  }, [startTime, endTime]);

  async function offer() {
    if (isPastMidpoint) {
      toast({ title: "Too late for swapping", description: "This shift has passed its halfway point.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await offerToCoverSwap(swapId);
      toast({ title: "Offer sent!", description: "Waiting for manager approval." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (mode === "offer") {
    return (
      <Button size="sm" className={`w-full ${isPastMidpoint ? "cursor-not-allowed opacity-40" : ""}`} onClick={offer} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
        Offer to cover
      </Button>
    );
  }

  return null;
}
