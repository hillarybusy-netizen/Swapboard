"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, UserCheck } from "lucide-react";
import type { SwapRequest } from "@/lib/database.types";

interface Props {
  swap: SwapRequest;
  userId: string;
  isManager: boolean;
  isRequester: boolean;
  isCovering: boolean;
}

export function SwapActionButtons({ swap, userId, isManager, isRequester, isCovering }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [managerNotes, setManagerNotes] = useState("");

  if (!["pending", "worker_accepted"].includes(swap.status)) return null;

  async function action(type: "offer" | "approve" | "reject" | "cancel") {
    setLoading(type);
    try {
      const supabase = createClient();
      if (type === "offer") {
        // Worker offers to cover
        await supabase.from("swap_requests").update({
          covering_worker_id: userId,
          status: "worker_accepted",
          worker_responded_at: new Date().toISOString(),
        }).eq("id", swap.id);
        toast({ title: "You offered to cover this shift!", description: "Waiting for manager approval." });
      } else if (type === "approve") {
        await supabase.from("swap_requests").update({
          status: "manager_approved",
          approved_by: userId,
          manager_responded_at: new Date().toISOString(),
          manager_notes: managerNotes || null,
        }).eq("id", swap.id);
        // Reassign shift to covering worker
        if (swap.covering_worker_id) {
          await supabase.from("shifts").update({ status: "swapped", assigned_to: swap.covering_worker_id }).eq("id", swap.shift_id);
        }
        toast({ title: "Swap approved!", variant: "success" });
      } else if (type === "reject") {
        await supabase.from("swap_requests").update({
          status: "rejected",
          approved_by: userId,
          manager_responded_at: new Date().toISOString(),
          manager_notes: managerNotes || null,
        }).eq("id", swap.id);
        await supabase.from("shifts").update({ status: "scheduled" }).eq("id", swap.shift_id);
        toast({ title: "Swap rejected" });
      } else if (type === "cancel") {
        await supabase.from("swap_requests").update({ status: "cancelled" }).eq("id", swap.id);
        await supabase.from("shifts").update({ status: "scheduled" }).eq("id", swap.shift_id);
        toast({ title: "Swap request cancelled" });
      }
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Worker: offer to cover */}
        {swap.status === "pending" && !isRequester && !isCovering && (
          <Button className="w-full" onClick={() => action("offer")} disabled={!!loading}>
            {loading === "offer" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Offer to cover this shift
          </Button>
        )}

        {/* Manager: approve/reject (after worker accepted) */}
        {isManager && swap.status === "worker_accepted" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Manager notes (optional)</Label>
              <Input placeholder="Add a note..." value={managerNotes} onChange={(e) => setManagerNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => action("approve")} disabled={!!loading}>
                {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve swap
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => action("reject")} disabled={!!loading}>
                {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Requester: cancel */}
        {isRequester && swap.status === "pending" && (
          <Button variant="outline" className="w-full text-destructive" onClick={() => action("cancel")} disabled={!!loading}>
            {loading === "cancel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Cancel request
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
