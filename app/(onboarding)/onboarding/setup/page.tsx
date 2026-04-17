"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INDUSTRY_TEMPLATES, type DepartmentTemplate } from "@/lib/industry-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Plus, X, Loader2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("onboarding_industry");
    if (!stored) { router.push("/onboarding/industry"); return; }
    setIndustry(stored);
    setDepartments(INDUSTRY_TEMPLATES[stored]?.departments ?? []);
  }, [router]);

  function removeDept(i: number) {
    setDepartments((d) => d.filter((_, idx) => idx !== i));
  }

  function addDept() {
    setDepartments((d) => [...d, { name: "", color: "#d4af37", roles: [] }]);
  }

  function updateDeptName(i: number, name: string) {
    setDepartments((d) => d.map((dept, idx) => idx === i ? { ...dept, name } : dept));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    if (departments.filter((d) => d.name.trim()).length === 0) {
      toast({ title: "Add at least one department", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create org
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);
      const { data: org, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name: orgName.trim(), industry: industry!, plan: "trial", trial_started_at: new Date().toISOString(), trial_ends_at: trialEnd.toISOString() })
        .select().single();
      if (orgErr) throw orgErr;

      // Create departments + roles
      for (let i = 0; i < departments.length; i++) {
        const dept = departments[i];
        if (!dept.name.trim()) continue;
        const { data: dbDept, error: deptErr } = await supabase
          .from("departments")
          .insert({ organization_id: org.id, name: dept.name, color: dept.color, requires_certification: dept.requiresCertification ?? false, sort_order: i })
          .select().single();
        if (deptErr) throw deptErr;
        if (dept.roles.length > 0) {
          await supabase.from("roles").insert(
            dept.roles.map((r) => ({ organization_id: org.id, department_id: dbDept.id, name: r.name, min_hours_notice: r.minHoursNotice }))
          );
        }
      }

      // Update profile
      const { error: profileErr } = await supabase.from("profiles")
        .update({ organization_id: org.id, user_role: "admin", onboarding_complete: false })
        .eq("id", user.id);
      if (profileErr) throw profileErr;

      sessionStorage.removeItem("onboarding_industry");
      router.push("/onboarding/invite");
      router.refresh();
    } catch (err: any) {
      toast({ title: "Setup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!industry) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 md:gap-3 mb-8 md:mb-12 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <button onClick={() => router.back()} className="hover:text-gold transition-colors flex items-center gap-1.5 md:gap-2">
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        <span className="opacity-50">/</span>
        <span className="text-gold">Step 02</span>
        <span className="opacity-50">/</span>
        <span>Infrastructure Setup</span>
      </div>

      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
          Initialize <br />
          <span className="text-gold-gradient">Your Workspace</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-lg">
          Personalize your organization structure. We&apos;ve suggested a blueprint based on your industry selection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Org name */}
        <div className="glass rounded-[1.5rem] md:rounded-[2rem] border-white/5 p-6 md:p-8 space-y-4 md:space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 md:w-1.5 h-5 md:h-6 bg-gold rounded-full" />
            <h2 className="font-black text-lg tracking-tight text-white uppercase tracking-widest text-[10px] md:text-[11px]">Identity</h2>
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="orgName" className="text-[11px] md:text-xs font-bold text-white/50 ml-1">Organization / business name</Label>
            <Input
              id="orgName" placeholder="e.g. Downtown Bistro..."
              value={orgName} onChange={(e) => setOrgName(e.target.value)} required 
              className="h-12 md:h-14 bg-white/5 border-white/10 rounded-xl md:rounded-2xl focus:ring-gold/50 focus:border-gold/50 text-base px-4"
            />
          </div>
        </div>

        {/* Departments */}
        <div className="glass rounded-[1.5rem] md:rounded-[2rem] border-white/5 p-6 md:p-8 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-1 md:w-1.5 h-5 md:h-6 bg-gold rounded-full" />
              <h2 className="font-black text-lg tracking-tight text-white uppercase tracking-widest text-[10px] md:text-[11px]">Operational Nodes</h2>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={addDept} className="text-gold hover:text-gold hover:bg-gold/10 font-bold text-[9px] md:text-[10px] uppercase tracking-widest px-0 md:px-3">
              <Plus className="w-3 h-3 mr-1.5 md:mr-2" /> <span className="hidden sm:inline">Add Department</span><span className="sm:hidden">Add</span>
            </Button>
          </div>
          
          <div className="grid gap-3">
            {departments.map((dept, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl group transition-all hover:bg-white/[0.04]">
                <div className="w-4 h-4 rounded-full shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-white/10" style={{ backgroundColor: dept.color }} />
                <Input
                  value={dept.name}
                  onChange={(e) => updateDeptName(i, e.target.value)}
                  placeholder="Department name"
                  className="bg-transparent border-none focus:ring-0 p-0 text-base font-semibold placeholder:text-white/10"
                />
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20 shrink-0 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                  {dept.roles.length > 0 ? (
                    <><span className="text-gold">{dept.roles.length}</span> <span className="hidden sm:inline">Defined Roles</span></>
                  ) : (
                    <span className="opacity-50 italic">Configure Roles in Settings</span>
                  )}
                </div>
                <button type="button" onClick={() => removeDept(i)} className="text-white/20 hover:text-red-500 transition-colors p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">
            Additional nodes and complex roles can be configured in Master Settings.
          </p>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-white/5">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest">
             Previous Step
          </Button>
          <Button type="submit" className="h-14 px-10 btn-gold rounded-full text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-gold/20 disabled:opacity-20" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Initialize Org <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
      <Link href="/onboarding/invite" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
