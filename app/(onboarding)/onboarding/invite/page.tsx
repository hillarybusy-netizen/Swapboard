"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, X, CheckCircle2, Loader2 } from "lucide-react";

interface Invite { email: string; role: "manager" | "worker" }

export default function InvitePage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "worker" }]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function addRow() { setInvites((i) => [...i, { email: "", role: "worker" }]) }
  function removeRow(i: number) { setInvites((v) => v.filter((_, idx) => idx !== i)) }
  function updateEmail(i: number, email: string) { setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, email } : inv)) }
  function updateRole(i: number, role: "manager" | "worker") { setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, role } : inv)) }

  async function handleSendInvites() {
    const valid = invites.filter((i) => i.email.trim());
    if (valid.length === 0) { goToDashboard(); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user!.id).single();
      if (!profile?.organization_id) throw new Error("No organization found");

      for (const inv of valid) {
        await supabase.from("invitations").insert({
          organization_id: profile.organization_id,
          email: inv.email.trim(),
          user_role: inv.role,
          invited_by: user!.id,
        });
      }
      setDone(true);
    } catch (err: any) {
      toast({ title: "Failed to send invites", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function goToDashboard() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", user!.id);
    router.push("/dashboard");
    router.refresh();
  }

  if (done) {
    return (
      <div className="text-center py-16">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invites sent!</h1>
        <p className="text-muted-foreground mb-8">Your team will receive an email with instructions to join SwapBoard.</p>
        <Button size="lg" onClick={goToDashboard}>Go to dashboard →</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
        <span className="font-semibold text-primary">Step 3</span>
        <span>/</span>
        <span>3 — Invite your team</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Invite your team</h1>
      <p className="text-muted-foreground mb-8">
        Add team members now, or skip and do it later from Settings.
      </p>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="grid grid-cols-[1fr_140px_36px] gap-2 text-xs text-muted-foreground font-medium px-1">
          <span>Email address</span>
          <span>Role</span>
          <span />
        </div>
        {invites.map((inv, i) => (
          <div key={i} className="grid grid-cols-[1fr_140px_36px] gap-2 items-center">
            <Input type="email" placeholder="colleague@company.com" value={inv.email} onChange={(e) => updateEmail(i, e.target.value)} />
            <Select value={inv.role} onValueChange={(v) => updateRole(i, v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="worker">Worker</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <button onClick={() => removeRow(i)} disabled={invites.length === 1} className="text-muted-foreground hover:text-destructive disabled:opacity-30">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-4 h-4" /> Add another
        </Button>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={goToDashboard}>Skip for now</Button>
        <Button size="lg" onClick={handleSendInvites} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Send invites & go to dashboard
        </Button>
      </div>
    </div>
  );
}
