"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { offerToCoverSwap, managerSwapAction, cancelSwapRequest } from "@/lib/actions/swaps";
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
      if (type === "offer") {
        await offerToCoverSwap(swap.id);
        toast({ title: "You offered to cover this shift!", description: "Waiting for manager approval." });
      } else if (type === "approve") {
        await managerSwapAction(swap.id, "approve", managerNotes);
        toast({ title: "Swap approved!", variant: "success" });
      } else if (type === "reject") {
        await managerSwapAction(swap.id, "reject", managerNotes);
        toast({ title: "Swap rejected" });
      } else if (type === "cancel") {
        await cancelSwapRequest(swap.id);
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
        {swap.status === "pending" && !isRequester && !isCovering && (
          <Button className="w-full" onClick={() => action("offer")} disabled={!!loading}>
            {loading === "offer" ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Offer to cover this shift
          </Button>
        )}

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
