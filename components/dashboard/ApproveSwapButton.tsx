"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function ApproveSwapButton({ swapId }: { swapId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const status = action === "approve" ? "manager_approved" : "rejected";
      const { error } = await supabase
        .from("swap_requests")
        .update({ status, approved_by: user?.id, manager_responded_at: new Date().toISOString() })
        .eq("id", swapId);
      if (error) throw error;

      if (action === "approve") {
        // Update shift status to swapped
        const { data: swap } = await supabase.from("swap_requests").select("shift_id, covering_worker_id").eq("id", swapId).single();
        if (swap) {
          await supabase.from("shifts").update({ status: "swapped", assigned_to: swap.covering_worker_id }).eq("id", swap.shift_id);
        }
      }

      toast({ title: action === "approve" ? "Swap approved!" : "Swap rejected", variant: action === "approve" ? "success" : "default" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-1 shrink-0">
      <Button size="icon" variant="ghost" className="w-8 h-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handle("approve")} disabled={!!loading}>
        {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
      </Button>
      <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:bg-red-50" onClick={() => handle("reject")} disabled={!!loading}>
        {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
      </Button>
    </div>
  );
}
