"use client";
import { useState, useEffect } from "react";
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
    setDepartments((d) => [...d, { name: "", color: "#6366f1", roles: [] }]);
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
      await supabase.from("profiles")
        .update({ organization_id: org.id, user_role: "admin", onboarding_complete: false })
        .eq("id", user.id);

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
    <div>
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
        <button onClick={() => router.back()} className="hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4 inline" /> Back
        </button>
        <span className="ml-2 font-semibold text-primary">Step 2</span>
        <span>/</span>
        <span>3 — Set up your organization</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">Set up your organization</h1>
      <p className="text-muted-foreground mb-8">
        We&apos;ve pre-filled departments based on your industry. Customize them to match your business.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Org name */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">Organization details</h2>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization / business name</Label>
            <Input
              id="orgName" placeholder="e.g. Downtown Bistro, City Medical Center"
              value={orgName} onChange={(e) => setOrgName(e.target.value)} required className="max-w-md"
            />
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Departments</h2>
            <Button type="button" variant="outline" size="sm" onClick={addDept}>
              <Plus className="w-4 h-4" /> Add department
            </Button>
          </div>
          <div className="space-y-2">
            {departments.map((dept, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                <Input
                  value={dept.name}
                  onChange={(e) => updateDeptName(i, e.target.value)}
                  placeholder="Department name"
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground shrink-0">
                  {dept.roles.length} role{dept.roles.length !== 1 ? "s" : ""}
                </span>
                <button type="button" onClick={() => removeDept(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            You can add, rename, and configure roles in Settings after setup.
          </p>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button type="submit" size="lg" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create organization <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
