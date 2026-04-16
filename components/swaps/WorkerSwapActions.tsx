"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UserCheck, X, Loader2 } from "lucide-react";

interface Props {
  swapId: string;
  userId: string;
  mode: "offer" | "cancel";
}

export function WorkerSwapActions({ swapId, userId, mode }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function offer() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("swap_requests").update({
        covering_worker_id: userId,
        status: "worker_accepted",
        worker_responded_at: new Date().toISOString(),
      }).eq("id", swapId);
      toast({ title: "Offer sent!", description: "Waiting for manager approval." });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
