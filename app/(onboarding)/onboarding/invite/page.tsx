"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { setupWorkspace, registerAndSetupWorkspace } from "@/lib/actions/setup";
import { sendInvitation } from "@/lib/actions/invitations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, X, CheckCircle2, Loader2, ChevronRight, AlertCircle, ChevronLeft, Eye, EyeOff, UserPlus } from "lucide-react";
import { catchError } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface Invite { email: string; role: "manager" | "worker"; department_id: string }

interface PendingDepartment {
  name: string;
  color: string;
  roles?: { name: string; minHoursNotice: number }[];
  requiresCertification?: boolean;
}

export default function InvitePage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invite[]>([{ email: "", role: "worker", department_id: "" }]);

  const [pendingOrgName, setPendingOrgName] = useState("");
  const [pendingDepartments, setPendingDepartments] = useState<PendingDepartment[]>([]);
  const [pendingIndustry, setPendingIndustry] = useState("");

  // null = still loading auth, false = anonymous, truthy = logged in user
  const [authUser, setAuthUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Account creation fields — anonymous users only
  const [fullName, setFullName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [showLogoDialog, setShowLogoDialog] = useState(false);

  useEffect(() => {
    const industry = sessionStorage.getItem("onboarding_industry");
    const setupRaw = sessionStorage.getItem("onboarding_setup");

    if (!industry || !setupRaw) {
      router.push("/onboarding/industry");
      return;
    }

    try {
      const setup = JSON.parse(setupRaw);
      setPendingOrgName(setup.orgName ?? "");
      setPendingDepartments(setup.departments ?? []);
      setPendingIndustry(industry);
    } catch {
      router.push("/onboarding/industry");
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setAuthUser(data.user ?? false);
      setAuthLoading(false);
    });
  }, [router]);

  function addRow() { setInvites((v) => [...v, { email: "", role: "worker", department_id: "" }]); }
  function removeRow(i: number) { setInvites((v) => v.filter((_, idx) => idx !== i)); }
  function updateEmail(i: number, email: string) { setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, email } : inv)); }
  function updateRole(i: number, role: "manager" | "worker") {
    setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, role, department_id: role === "manager" ? "" : inv.department_id } : inv));
  }
  function updateDept(i: number, department_name: string) {
    setInvites((v) => v.map((inv, idx) => idx === i ? { ...inv, department_id: department_name } : inv));
  }

  const workersMissingDept = invites.some((inv) => inv.email.trim() && inv.role === "worker" && !inv.department_id);
  const isAnonymous = authUser === false;

  async function finalize(skipInvites: boolean) {
    setSubmitted(true);

    if (!skipInvites) {
      const valid = invites.filter((i) => i.email.trim());
      if (valid.length > 0) {
        const workerNoDept = valid.find((inv) => inv.role === "worker" && !inv.department_id);
        if (workerNoDept) {
          toast({ title: "Department required", description: "Please select a department for every worker invite.", variant: "destructive" });
          return;
        }
      }
    }

    setLoading(true);
    try {
      let orgId: string;
      let departmentMap: Record<string, string>;

      if (isAnonymous) {
        if (!fullName.trim() || !accountEmail.trim() || accountPassword.length < 8) {
          toast({ title: "Account details required", description: "Please fill in your name, email and a password (min. 8 characters).", variant: "destructive" });
          setLoading(false);
          return;
        }

        if (!termsAccepted) {
          toast({ title: "Terms required", description: "Please agree to the Terms of Service and Privacy Policy.", variant: "destructive" });
          setLoading(false);
          return;
        }

        const result = await registerAndSetupWorkspace({
          fullName,
          email: accountEmail,
          password: accountPassword,
          orgName: pendingOrgName,
          industry: pendingIndustry,
          departments: pendingDepartments,
          honeypot,
        });

        if (!result.success) {
          toast({ title: "Setup Failed", description: result.error, variant: "destructive" });
          setLoading(false);
          return;
        }

        // Honeypot triggered — silent exit
        if (!result.orgId) {
          setLoading(false);
          return;
        }

        orgId = result.orgId;
        departmentMap = result.departmentMap!;
      } else {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const setup = await setupWorkspace(user.id, pendingOrgName, pendingIndustry, pendingDepartments);
        orgId = setup.orgId;
        departmentMap = setup.departmentMap;
      }

      if (!skipInvites) {
        const valid = invites.filter((i) => i.email.trim());
        for (const inv of valid) {
          const resolvedDeptId = inv.role === "manager" ? "" : (departmentMap[inv.department_id] ?? "");
          await sendInvitation({
            email: inv.email.trim(),
            role: inv.role,
            department_id: resolvedDeptId,
            organization_id: orgId,
            organization_name: pendingOrgName,
          });
        }
      }

      if (!isAnonymous && authUser?.id) {
        const supabase = createClient();
        await supabase.from("profiles").update({ onboarding_complete: true }).eq("id", authUser.id);
      }

      sessionStorage.removeItem("onboarding_industry");
      sessionStorage.removeItem("onboarding_setup");

      if (skipInvites) {
        window.location.href = "/dashboard";
      } else {
        setDone(true);
      }
    } catch (err: any) {
      console.error("[finalize] error:", err);
      toast({ title: "Setup Failed", description: catchError(err), variant: "destructive" });
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-12 md:py-16 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <CheckCircle2 className="w-10 h-10 text-gold animate-in zoom-in slide-in-from-top-1 duration-1000 delay-300" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tighter">Transmission Successful</h1>
        <p className="text-white/40 text-sm font-medium mb-8 max-w-sm mx-auto">Your workspace is live and team invitations have been dispatched.</p>
        <Button className="h-12 px-10 btn-gold rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-gold/20" onClick={() => setShowLogoDialog(true)}>
          Enter Workspace <ChevronRight className="w-4 h-4 ml-2" />
        </Button>

        <Dialog open={showLogoDialog} onOpenChange={setShowLogoDialog}>
          <DialogContent className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-white/10 shadow-2xl text-white sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Complete Your Branding</DialogTitle>
              <DialogDescription className="text-white/60">
                Would you like to upload your company logo now?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-6">
              <Button onClick={() => { window.location.href = "/settings"; }} className="btn-gold w-full">Go to Settings</Button>
              <Button variant="ghost" onClick={() => { window.location.href = "/dashboard"; }} className="w-full text-white/40 hover:text-white">Not Now</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 mb-4 md:mb-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <button onClick={() => router.back()} className="hover:text-gold transition-colors flex items-center gap-1.5">
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        <span className="opacity-50">/</span>
        <span className="text-gold">Step 03</span>
        <span className="opacity-50">/</span>
        <span>{isAnonymous ? "Create Account & Deploy" : "Personnel Enrollment"}</span>
      </div>

      <div className="mb-5 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 leading-tight">
          {isAnonymous ? (
            <>
              Almost there —{" "}
              <span className="text-gold-gradient">Create Your Account</span>
            </>
          ) : (
            <>
              Invite{" "}
              <span className="text-gold-gradient">Your Core Team</span>
            </>
          )}
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-lg">
          {isAnonymous
            ? "Your workspace is ready. Create your account to activate it — nothing is saved until you click Deploy."
            : "Onboard your initial staff to begin coordinating shifts. You can always manage invitations later."}
        </p>
        {pendingOrgName && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-gold/70">Setting up</span>
            <span className="text-sm font-bold text-white">{pendingOrgName}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 md:space-y-5">
      {/* Account creation — anonymous users only */}
      {isAnonymous && !authLoading && (
        <div className="glass rounded-[1.25rem] md:rounded-[1.5rem] border border-white/5 p-5 md:p-6 space-y-4">
          {/* Honeypot — invisible to real users */}
          <div aria-hidden="true" style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1, overflow: "hidden" }}>
            <label htmlFor="invite_website">Website</label>
            <input
              type="text"
              id="invite_website"
              name="invite_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-gold rounded-full" />
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-gold" />
              <h2 className="font-black text-white uppercase tracking-widest text-[10px] md:text-[11px]">Your Account</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[11px] md:text-xs font-bold text-white/50 ml-1">Full name</Label>
              <Input
                id="fullName" placeholder="Jane Smith" value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl focus:ring-gold/50 focus:border-gold/50 px-4"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountEmail" className="text-[11px] md:text-xs font-bold text-white/50 ml-1">Work email</Label>
              <Input
                id="accountEmail" type="email" placeholder="jane@company.com" value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl focus:ring-gold/50 focus:border-gold/50 px-4"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accountPassword" className="text-[11px] md:text-xs font-bold text-white/50 ml-1">
              Password <span className="text-white/25 normal-case">(min. 8 characters)</span>
            </Label>
            <div className="relative">
              <Input
                id="accountPassword" type={showPassword ? "text" : "password"} placeholder="••••••••"
                value={accountPassword} onChange={(e) => setAccountPassword(e.target.value)}
                className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl focus:ring-gold/50 focus:border-gold/50 px-4 pr-12" maxLength={72}
              />
              <button
                type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/20 text-gold focus:ring-gold/50 focus:ring-offset-0 cursor-pointer accent-gold"
            />
            <Label htmlFor="terms" className="text-[11px] md:text-xs text-white/70 leading-relaxed font-medium cursor-pointer flex-1">
              I agree to the{" "}
              <Link href="/terms" className="text-gold hover:underline" target="_blank">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-gold hover:underline" target="_blank">Privacy Policy</Link>.
            </Label>
          </div>

          <p className="text-[10px] text-white/25 font-medium px-1">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-light transition-colors font-bold">Sign in instead</Link>
          </p>
        </div>
      )}

      {/* Team invites */}
      <div className="glass rounded-[1.25rem] md:rounded-[1.5rem] border border-white/5 p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 bg-gold rounded-full" />
          <h2 className="font-black text-white uppercase tracking-widest text-[10px] md:text-[11px]">
            Invite Core Team <span className="text-white/25 normal-case font-medium">(optional)</span>
          </h2>
        </div>

        <div className="hidden md:grid grid-cols-[1fr_140px_160px_48px] gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-1">
          <span>Email address</span>
          <span>Access Level</span>
          <span>Department <span className="text-red-400">*</span></span>
          <span />
        </div>

        <div className="space-y-2.5">
          {invites.map((inv, i) => {
            const isWorker = inv.role === "worker";
            const missingDept = submitted && isWorker && !!inv.email.trim() && !inv.department_id;
            return (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-1 md:grid-cols-[1fr_140px_160px_48px] gap-3 items-center p-3 md:p-3.5 rounded-xl md:rounded-2xl border transition-all duration-300",
                  "bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-gold/[0.04]"
                )}
              >
                <Input
                  type="email" placeholder="colleague@company.com" value={inv.email}
                  onChange={(e) => updateEmail(i, e.target.value)}
                  className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl focus:ring-gold/50 focus:border-gold/50 text-white placeholder:text-white/10"
                />
                <Select value={inv.role} onValueChange={(v) => updateRole(i, v as any)}>
                  <SelectTrigger className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl text-white font-bold focus:ring-gold/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl">
                    <SelectItem value="worker" className="focus:bg-gold focus:text-[#050505] font-bold">Worker Access</SelectItem>
                    <SelectItem value="manager" className="focus:bg-gold focus:text-[#050505] font-bold">Manager Access</SelectItem>
                  </SelectContent>
                </Select>

                {isWorker ? (
                  <Select value={inv.department_id} onValueChange={(v) => updateDept(i, v)}>
                    <SelectTrigger className={cn(
                      "h-11 md:h-12 rounded-xl md:rounded-2xl font-bold transition-colors",
                      missingDept ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-white/5 border-white/10 text-white"
                    )}>
                      <SelectValue placeholder={missingDept ? "Required" : "Department"} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl">
                      {pendingDepartments.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-white/30">No departments set up yet</div>
                      ) : pendingDepartments.map((d) => (
                        <SelectItem key={d.name} value={d.name} className="focus:bg-gold focus:text-[#050505] font-bold">{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-11 md:h-12 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl flex items-center px-4 text-[10px] font-bold text-white/30 uppercase tracking-wider select-none cursor-not-allowed">
                    All Access
                  </div>
                )}

                <button
                  onClick={() => removeRow(i)} disabled={invites.length === 1}
                  className="w-11 h-11 flex items-center justify-center text-white/20 hover:text-red-400 disabled:opacity-30 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {submitted && workersMissingDept && (
          <div className="flex items-center gap-2 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Worker invites require a department.
          </div>
        )}

        <Button type="button" variant="ghost" size="sm" onClick={addRow} className="text-gold hover:text-gold hover:bg-gold/10 font-bold text-[10px] uppercase tracking-widest">
          <Plus className="w-3 h-3 mr-2" /> Add Personnel
        </Button>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between mt-2 md:mt-4 pt-5 border-t border-white/5 gap-4">
        <Button
          variant="ghost" onClick={() => finalize(true)} disabled={loading}
          className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest w-full sm:w-auto"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {isAnonymous ? "Skip invites — just create account" : "Provision Later"}
        </Button>
        <Button
          className="h-12 px-8 btn-gold rounded-full text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-gold/20 disabled:opacity-20 w-full sm:w-auto active:scale-95 transition-all"
          onClick={() => finalize(false)} disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isAnonymous ? "Create Account & Deploy" : "Finalize & Deploy"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      </div>
      <Link href="/dashboard" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
