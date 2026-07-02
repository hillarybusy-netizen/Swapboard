"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { offerToCoverSwap } from "@/lib/actions/swaps";
import { toast } from "@/hooks/use-toast";
import { UserCheck, Loader2 } from "lucide-react";

interface Props {
  swapId: string;
  mode: "offer" | "cancel";
}

export function WorkerSwapActions({ swapId, mode }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function offer() {
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
      <Button size="sm" className="w-full" onClick={offer} disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
        Offer to cover
      </Button>
    );
  }

  return null;
}
