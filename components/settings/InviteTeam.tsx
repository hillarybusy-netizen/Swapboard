"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Send, Loader2, Lock } from "lucide-react";
import { Organization } from "@/lib/database.types";
import { checkPlanLimit } from "@/lib/plans";

interface Invite { email: string; role: string; department_id: string }

export function InviteTeam({ orgId, departments, org, profileCount }: { orgId: string; departments: any[]; org: Organization; profileCount: number }) {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "worker", department_id: "" }]);
  const [loading, setLoading] = useState(false);

  const maxWorkers = checkPlanLimit(org.plan, "maxWorkers");
  const isAtLimit = profileCount >= maxWorkers;

  function addRow() { 
    if (profileCount + invites.length >= maxWorkers) {
      toast({ title: "Limit Reached", description: `Your ${org.plan} plan is limited to ${maxWorkers} workers. Upgrade to Grow for more.`, variant: "destructive" });
      return;
    }
    setInvites((v) => [...v, { email: "", role: "worker", department_id: "" }]) 
  }
  function removeRow(i: number) { setInvites((v) => v.filter((_, idx) => idx !== i)) }
  function update(i: number, field: keyof Invite, val: string) { setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, [field]: val } : inv)) }

  async function sendInvites() {
    const valid = invites.filter((i) => i.email.trim());
    if (valid.length === 0) return;
    
    if (profileCount + valid.length > maxWorkers) {
      toast({ title: "Limit Exceeded", description: `Sending these invites would put you over your ${maxWorkers} worker limit.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      for (const inv of valid) {
        await supabase.from("invitations").insert({
          organization_id: orgId,
          email: inv.email.trim(),
          user_role: inv.role,
          department_id: inv.department_id || null,
          invited_by: user?.id,
        });
      }
      toast({ title: `${valid.length} invite${valid.length > 1 ? "s" : ""} sent!`, variant: "success" });
      setInvites([{ email: "", role: "worker", department_id: "" }]);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite team members</CardTitle>
        <CardDescription>Send email invitations to your staff</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {invites.map((inv, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_160px_32px] gap-2 items-center">
              <Input type="email" placeholder="email@company.com" value={inv.email} onChange={(e) => update(i, "email", e.target.value)} />
              <Select value={inv.role} onValueChange={(v) => update(i, "role", v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="worker">Worker</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <Select value={inv.department_id} onValueChange={(v) => update(i, "department_id", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <button onClick={() => removeRow(i)} disabled={invites.length === 1} className="text-muted-foreground hover:text-destructive disabled:opacity-30">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={addRow}>
            <Plus className="w-4 h-4" /> Add row
          </Button>
          <Button onClick={sendInvites} disabled={loading || invites.every((i) => !i.email.trim())}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send invites
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
