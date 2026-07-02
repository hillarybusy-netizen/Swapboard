"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, X, Send, Loader2, Link2, Copy, Check, AlertCircle } from "lucide-react";
import { Organization } from "@/lib/database.types";
import { checkPlanLimit } from "@/lib/plans";
import { sendInvitation, createManualInvitation } from "@/lib/actions/invitations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Invite { email: string; role: string; department_id: string; manager_type?: string }

export function InviteTeam({
  orgId,
  departments,
  org,
  profileCount,
}: {
  orgId: string;
  departments: any[];
  org: Organization;
  profileCount: number;
}) {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "worker", department_id: "", manager_type: "general" }]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Link generation state
  const [linkRole, setLinkRole] = useState("worker");
  const [linkManagerType, setLinkManagerType] = useState("general");
  const [linkDept, setLinkDept] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkSubmitted, setLinkSubmitted] = useState(false);

  const maxWorkers = checkPlanLimit(org.plan, "maxWorkers");

  function addRow() {
    if (profileCount + invites.length >= maxWorkers) {
      toast({ title: "Limit Reached", description: `Your ${org.plan} plan is limited to ${maxWorkers} workers. Upgrade to grow for more.`, variant: "destructive" });
      return;
    }
    setInvites((v) => [...v, { email: "", role: "worker", department_id: "", manager_type: "general" }]);
  }
  function removeRow(i: number) { setInvites((v) => v.filter((_, idx) => idx !== i)); }

  function update(i: number, field: keyof Invite, val: string) {
    setInvites((v) => v.map((inv, idx) => {
      if (idx !== i) return inv;
      const updated = { ...inv, [field]: val };
      if (field === "role" && val === "worker") {
        updated.manager_type = undefined;
      }
      if (field === "role" && val === "admin") {
        updated.manager_type = undefined;
        updated.department_id = "";
      }
      if (field === "role" && val === "manager") {
        updated.manager_type = "general";
        updated.department_id = "";
      }
      return updated;
    }));
  }

  const workersMissingDept = invites.some((inv) => inv.role === "worker" && !inv.department_id);

  async function sendInvites() {
    setSubmitted(true);
    const valid = invites.filter((i) => i.email.trim());
    if (valid.length === 0) return;

    const workerNoDept = valid.find((inv) => inv.role === "worker" && !inv.department_id);
    if (workerNoDept) {
      toast({ title: "Department required", description: "Please select a department for every worker invite.", variant: "destructive" });
      return;
    }

    const managerNoDept = valid.find((inv) => inv.role === "manager" && inv.manager_type === "department" && !inv.department_id);
    if (managerNoDept) {
      toast({ title: "Department required", description: "Please select a department for every department manager invite.", variant: "destructive" });
      return;
    }

    if (profileCount + valid.length > maxWorkers) {
      toast({ title: "Limit Exceeded", description: `Sending these invites would exceed your ${maxWorkers} worker limit.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      for (const inv of valid) {
        const deptId = inv.role === "worker" ? inv.department_id : (inv.manager_type === "department" ? inv.department_id : "");
        const res = await sendInvitation({
          email: inv.email,
          role: inv.role,
          department_id: deptId,
          manager_type: inv.role === "manager" ? inv.manager_type : undefined,
          organization_id: orgId,
          organization_name: org.name,
        });
        if (!res.success) {
          toast({ title: "Failed to send invitation", description: res.error, variant: "destructive" });
          return;
        }
      }
      toast({ title: `${valid.length} invite${valid.length > 1 ? "s" : ""} sent!`, variant: "success" });
      setInvites([{ email: "", role: "worker", department_id: "", manager_type: "general" }]);
      setSubmitted(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "An unexpected error occurred", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateLink() {
    setLinkSubmitted(true);
    if (linkRole === "worker" && !linkDept) {
      toast({ title: "Department required", description: "Select a department for this worker invite link.", variant: "destructive" });
      return;
    }
    if (linkRole === "manager" && linkManagerType === "department" && !linkDept) {
      toast({ title: "Department required", description: "Select a department for this department manager invite link.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const deptId = linkRole === "worker" ? linkDept : (linkRole === "manager" && linkManagerType === "department" ? linkDept : "");
      const res = await createManualInvitation({
        role: linkRole,
        department_id: deptId,
        manager_type: linkRole === "manager" ? linkManagerType : undefined,
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

  const deptNameForLink = linkRole === "manager" && linkManagerType === "general" ? "General Access" : departments.find((d) => d.id === linkDept)?.name;

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

        {/* ── EMAIL TAB ── */}
        <TabsContent value="email" className="p-6 focus-visible:ring-0">
          <div className="space-y-4">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[1fr_120px_160px_32px] gap-2 px-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Email</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Role</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                Department <span className="text-red-400">*</span>
              </span>
              <span />
            </div>

            <div className="space-y-3">
              {invites.map((inv, i) => {
                const isWorker = inv.role === "worker";
                const isManager = inv.role === "manager";
                const missingDept = submitted && isWorker && !inv.department_id;
                const missingManagerDept = submitted && isManager && inv.manager_type === "department" && !inv.department_id;
                return (
                  <div key={i} className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_160px_32px] gap-2 items-center">
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

                      {/* Manager Type or Department */}
                      {isManager ? (
                        <Select value={inv.manager_type || "general"} onValueChange={(v) => {
                          setInvites((prev) => prev.map((invite, idx) => {
                            if (idx === i) {
                              const updated = { ...invite, manager_type: v };
                              if (v === "general") {
                                updated.department_id = "";
                              }
                              return updated;
                            }
                            return invite;
                          }));
                        }}>
                          <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#050505] border-white/10">
                            <SelectItem value="general">General Manager</SelectItem>
                            <SelectItem value="department">Department Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : isWorker ? (
                        <Select value={inv.department_id} onValueChange={(v) => update(i, "department_id", v)}>
                          <SelectTrigger className={`h-10 rounded-xl transition-colors ${missingDept ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-white/5 border-white/10"}`}>
                            <SelectValue placeholder={missingDept ? "Required ↑" : "Department"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#050505] border-white/10">
                            {departments.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-white/30">No departments yet</div>
                            ) : (
                              departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center px-3 text-[10px] font-bold text-white/30 uppercase tracking-wider select-none cursor-not-allowed">
                          All Access (N/A)
                        </div>
                      )}

                      <button
                        onClick={() => removeRow(i)}
                        disabled={invites.length === 1}
                        className="text-white/20 hover:text-red-500 disabled:opacity-30 flex justify-center"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Department selector for department managers */}
                    {isManager && inv.manager_type === "department" && (
                      <div className="md:pl-[calc(120px+1rem)]">
                        <Select value={inv.department_id} onValueChange={(v) => update(i, "department_id", v)}>
                          <SelectTrigger className={`h-10 rounded-xl transition-colors ${missingManagerDept ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-white/5 border-white/10"}`}>
                            <SelectValue placeholder={missingManagerDept ? "Required" : "Select Department"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#050505] border-white/10">
                            {departments.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-white/30">No departments yet</div>
                            ) : (
                              departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Validation banner */}
            {submitted && workersMissingDept && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Worker invites require a department to be selected.
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={addRow} className="text-white/40 hover:text-gold hover:bg-gold/10 text-[9px] font-black uppercase tracking-widest">
                <Plus className="w-4 h-4 mr-2" /> Add another person
              </Button>
              <Button
                onClick={sendInvites}
                disabled={loading || invites.every((i) => !i.email.trim())}
                className="btn-gold rounded-full px-8 text-xs font-black uppercase tracking-widest h-12"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Send Invitations
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── LINK TAB ── */}
        <TabsContent value="link" className="p-6 focus-visible:ring-0">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role selector */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Access</Label>
                <Select
                  value={linkRole}
                  onValueChange={(v) => {
                    setLinkRole(v);
                    setLinkDept("");
                    setLinkManagerType("general");
                    setLinkSubmitted(false);
                    setGeneratedLink("");
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

              {/* Manager Type or Department selector */}
              <div className="space-y-2">
                {linkRole === "manager" ? (
                  <>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Manager Type</Label>
                    <Select value={linkManagerType} onValueChange={(v) => {
                      setLinkManagerType(v);
                      if (v === "general") {
                        setLinkDept("");
                      }
                      setGeneratedLink("");
                    }}>
                      <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#050505] border-white/10">
                        <SelectItem value="general">General Manager</SelectItem>
                        <SelectItem value="department">Department Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Target Department
                      {linkRole === "worker" && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    {linkRole === "admin" ? (
                      <div className="h-10 bg-white/[0.02] border border-white/5 rounded-xl flex items-center px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider select-none cursor-not-allowed">
                        All Access (N/A)
                      </div>
                    ) : (
                      <>
                        <Select value={linkDept} onValueChange={(v) => { setLinkDept(v); setGeneratedLink(""); }}>
                          <SelectTrigger className={`rounded-xl transition-colors ${linkSubmitted && !linkDept ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-white/5 border-white/10"}`}>
                            <SelectValue placeholder={linkSubmitted && !linkDept ? "Required — pick a department" : "Select Department"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#050505] border-white/10">
                            {departments.length === 0 ? (
                              <div className="px-3 py-2 text-xs text-white/30">No departments yet</div>
                            ) : (
                              departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)
                            )}
                          </SelectContent>
                        </Select>
                        {linkSubmitted && !linkDept && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-400">
                            <AlertCircle className="w-3 h-3" /> Select a department before generating.
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Generated link display */}
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
                  Share this link to invite a {linkRole === "manager" ? `${linkManagerType} manager` : linkRole}{deptNameForLink ? ` — ${deptNameForLink}` : ""}.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setGeneratedLink(""); setLinkSubmitted(false); }}
                  className="w-full text-white/30 hover:text-white text-[9px] font-black uppercase tracking-widest"
                >
                  Generate New Link
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-white/20" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Temporary Join Link</h4>
                  <p className="text-[10px] text-white/40 max-w-[240px] leading-relaxed">
                    Generate a secure, single-use link valid for 30 minutes.
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
