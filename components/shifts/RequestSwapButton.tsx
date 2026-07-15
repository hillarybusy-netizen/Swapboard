"use client";
import { catchError } from "@/lib/errors";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { requestSwap } from "@/lib/actions/swaps";
import { toast } from "@/hooks/use-toast";
import { ArrowLeftRight, Loader2 } from "lucide-react";

const REASONS = [
  "Personal appointment",
  "Medical / health",
  "Family emergency",
  "Schedule conflict",
  "Vacation / travel",
  "Other",
];

export function RequestSwapButton({
  shiftId,
  shiftTitle,
  startTime,
  endTime,
}: {
  shiftId: string;
  shiftTitle: string;
  startTime: string;
  endTime: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPastMidpoint, setIsPastMidpoint] = useState(false);

  useEffect(() => {
    const updateCutoff = () => {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      setIsPastMidpoint(Date.now() >= start + (end - start) / 2);
    };
    updateCutoff();
    const timer = window.setInterval(updateCutoff, 30_000);
    return () => window.clearInterval(timer);
  }, [startTime, endTime]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason) return;
    setLoading(true);
    try {
      await requestSwap(shiftId, finalReason);
      toast({ title: "Swap requested!", description: "Your manager will review your request." });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`gap-2 ${isPastMidpoint ? "cursor-not-allowed opacity-40" : ""}`}
          onClick={(event) => {
            if (!isPastMidpoint) return;
            event.preventDefault();
            toast({ title: "Too late for swapping", description: "This shift has passed its halfway point.", variant: "destructive" });
          }}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Request swap
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request swap for {shiftTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {reason === "Other" && (
            <div className="space-y-2">
              <Label>Details</Label>
              <Input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Brief description..." required />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
