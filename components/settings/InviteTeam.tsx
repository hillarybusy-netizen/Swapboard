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
import { Plus, X, Send, Loader2, Link2, Copy, Check } from "lucide-react";
import { Organization } from "@/lib/database.types";
import { checkPlanLimit } from "@/lib/plans";
import { sendInvitation, createManualInvitation } from "@/lib/actions/invitations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Invite { email: string; role: string; department_id: string }

export function InviteTeam({ orgId, departments, org, profileCount }: { orgId: string; departments: any[]; org: Organization; profileCount: number }) {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "worker", department_id: "" }]);
  const [loading, setLoading] = useState(false);
  
  // Link generation state
  const [linkRole, setLinkRole] = useState("worker");
  const [linkDept, setLinkDept] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

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
  
  function update(i: number, field: keyof Invite, val: string) {
    setInvites((v) => v.map((inv, idx) => {
      if (idx === i) {
        const updated = { ...inv, [field]: val };
        // If role becomes manager/admin, clear department_id
        if (field === "role" && (val === "manager" || val === "admin")) {
          updated.department_id = "";
        }
        return updated;
      }
      return inv;
    }));
  }

  async function sendInvites() {
    const valid = invites.filter((i) => i.email.trim());
    if (valid.length === 0) return;
    
    if (profileCount + valid.length > maxWorkers) {
      toast({ title: "Limit Exceeded", description: `Sending these invites would put you over your ${maxWorkers} worker limit.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      for (const inv of valid) {
        const res = await sendInvitation({
          email: inv.email,
          role: inv.role,
          department_id: (inv.role === "manager" || inv.role === "admin") ? "" : inv.department_id,
          organization_id: orgId,
          organization_name: org.name,
        });
        if (!res.success) {
          toast({ title: "Failed to send invitation", description: res.error, variant: "destructive" });
          return;
        }
      }
      
      toast({ title: `${valid.length} invite${valid.length > 1 ? "s" : ""} sent!`, variant: "success" });
      setInvites([{ email: "", role: "worker", department_id: "" }]);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLink() {
    setLoading(true);
    try {
      const res = await createManualInvitation({
        role: linkRole,
        department_id: (linkRole === "manager" || linkRole === "admin") ? "" : linkDept,
        organization_id: orgId,
      });
      
      if (!res.success || !res.invitation) {
        toast({ title: "Failed to generate link", description: res.error, variant: "destructive" });
        return;
      }
      
      const link = `${window.location.origin}/invite?token=${res.invitation.token}`;
      setGeneratedLink(link);
      toast({ title: "Invitation link generated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied to clipboard!" });
  };

  return (
    <Card className="glass border-white/5 overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Invite Team</CardTitle>
        <CardDescription className="text-white/40 text-xs font-medium">Add members to your organization</CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="email" className="w-full">
        <div className="px-6 pt-6">
          <TabsList className="bg-white/5 border border-white/10 w-full md:w-auto">
            <TabsTrigger value="email" className="data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[10px] font-black uppercase tracking-widest px-6">Email Invites</TabsTrigger>
            <TabsTrigger value="link" className="data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[10px] font-black uppercase tracking-widest px-6">Invitation Link</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="email" className="p-6 focus-visible:ring-0">
          <div className="space-y-4">
            <div className="space-y-3">
              {invites.map((inv, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_120px_160px_32px] gap-2 items-center">
                  <Input 
                    type="email" 
                    placeholder="email@company.com" 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={inv.email} 
                    onChange={(e) => update(i, "email", e.target.value)} 
                  />
                  <Select value={inv.role} onValueChange={(v) => update(i, "role", v)}>
                    <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#050505] border-white/10">
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {inv.role === "manager" || inv.role === "admin" ? (
                    <div className="h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center px-3 text-[10px] font-bold text-white/30 uppercase tracking-wider select-none cursor-not-allowed">
                      All Access (N/A)
                    </div>
                  ) : (
                    <Select value={inv.department_id} onValueChange={(v) => update(i, "department_id", v)}>
                      <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#050505] border-white/10">
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  <button onClick={() => removeRow(i)} disabled={invites.length === 1} className="text-white/20 hover:text-red-500 disabled:opacity-30 flex justify-center">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={addRow} className="text-white/40 hover:text-gold hover:bg-gold/10 text-[9px] font-black uppercase tracking-widest">
                <Plus className="w-4 h-4 mr-2" /> Add another person
              </Button>
              <Button onClick={sendInvites} disabled={loading || invites.every((i) => !i.email.trim())} className="btn-gold rounded-full px-8 text-xs font-black uppercase tracking-widest h-12">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Invitations
              </Button>
            </div>
          </div>
        </TabsContent>
 
        <TabsContent value="link" className="p-6 focus-visible:ring-0">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Access</Label>
                <Select 
                  value={linkRole} 
                  onValueChange={(v) => {
                    setLinkRole(v);
                    if (v === "manager" || v === "admin") {
                      setLinkDept("");
                    }
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#050505] border-white/10">
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Department</Label>
                {linkRole === "manager" || linkRole === "admin" ? (
                  <div className="h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider select-none cursor-not-allowed">
                    All Access (N/A)
                  </div>
                ) : (
                  <Select value={linkDept} onValueChange={setLinkDept}>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#050505] border-white/10">
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {generatedLink ? (
              <div className="space-y-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold">Link Generated</span>
                  <span className="text-[9px] font-black text-red-500/60 uppercase">Expires in 30 minutes</span>
                </div>
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="bg-[#0a0a0a] border-white/5 text-white/60 text-xs" />
                  <Button onClick={copyToClipboard} size="icon" className="bg-white/5 hover:bg-white/10 border-white/10 shrink-0">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-white/30 font-medium italic text-center pt-1">
                  Share this link with anyone you want to invite as a {linkRole}.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white/20" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Temporary Join Link</h4>
                  <p className="text-[10px] text-white/40 max-w-[240px] leading-relaxed">
                    Generate a secure, single-use link that anyone can use to join your team. Valid for 30 minutes.
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateLink} 
                  disabled={loading} 
                  className="btn-gold rounded-full px-8 text-xs font-black uppercase tracking-widest h-12"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                  Generate 30-Min Link
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
