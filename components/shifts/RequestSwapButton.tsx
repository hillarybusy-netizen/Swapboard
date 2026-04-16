"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
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

export function RequestSwapButton({ shiftId, shiftTitle }: { shiftId: string; shiftTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user!.id).single();
      const { error } = await supabase.from("swap_requests").insert({
        organization_id: profile!.organization_id,
        requester_id: user!.id,
        shift_id: shiftId,
        reason: finalReason,
        status: "pending",
      });
      if (error) throw error;
      await supabase.from("shifts").update({ status: "swap_pending" }).eq("id", shiftId);
      toast({ title: "Swap requested!", description: "Your manager and available teammates have been notified." });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><ArrowLeftRight className="w-4 h-4" /> Request swap</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a shift swap</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Shift: <span className="font-medium text-foreground">{shiftTitle}</span></p>
          <div className="space-y-2">
            <Label>Reason for swap</Label>
            <Select value={reason} onValueChange={setReason} required>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {reason === "Other" && (
            <div className="space-y-2">
              <Label>Please describe</Label>
              <Input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Brief description..." required />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !reason}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
