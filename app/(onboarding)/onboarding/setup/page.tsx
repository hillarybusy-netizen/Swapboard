"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INDUSTRY_TEMPLATES, type DepartmentTemplate } from "@/lib/industry-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Plus, X } from "lucide-react";

const DEPARTMENT_COLOR_PALETTE = [
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#ec4899",
  "#f59e0b",
  "#64748b",
  "#14b8a6",
  "#a855f7",
  "#f43f5e",
];

function getNextDepartmentColor(departments: DepartmentTemplate[]): string {
  const used = new Set(departments.map((d) => d.color));
  const available = DEPARTMENT_COLOR_PALETTE.find((color) => !used.has(color));
  if (available) return available;
  return DEPARTMENT_COLOR_PALETTE[departments.length % DEPARTMENT_COLOR_PALETTE.length];
}

export default function SetupPage() {
  const router = useRouter();
  const storedIndustry = typeof window !== "undefined" ? sessionStorage.getItem("onboarding_industry") : null;
  const savedSetup = typeof window !== "undefined" ? sessionStorage.getItem("onboarding_setup") : null;
  const [orgName, setOrgName] = useState(() => {
    if (!savedSetup) return "";
    try {
      const parsed = JSON.parse(savedSetup);
      return parsed.orgName ?? "";
    } catch {
      return "";
    }
  });
  const [industry, setIndustry] = useState<string | null>(storedIndustry);
  const [departments, setDepartments] = useState<DepartmentTemplate[]>(() => {
    if (!savedSetup) {
      return INDUSTRY_TEMPLATES[storedIndustry ?? ""]?.departments ?? [];
    }

    try {
      const parsed = JSON.parse(savedSetup);
      return parsed.departments ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!storedIndustry) {
      router.push("/onboarding/industry");
    }
  }, [router, storedIndustry]);

  function removeDept(i: number) {
    setDepartments((d) => d.filter((_, idx) => idx !== i));
  }

  function addDept() {
    setDepartments((d) => [...d, { name: "", color: getNextDepartmentColor(d) }]);
  }

  function updateDeptName(i: number, name: string) {
    setDepartments((d) => d.map((dept, idx) => idx === i ? { ...dept, name } : dept));
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!orgName.trim()) return;
    if (departments.filter((d) => d.name.trim()).length === 0) {
      toast({ title: "Add at least one department", variant: "destructive" });
      return;
    }

    sessionStorage.setItem("onboarding_setup", JSON.stringify({
      orgName: orgName.trim(),
      departments: departments.filter((d) => d.name.trim()),
    }));

    router.push("/onboarding/invite");
  }

  if (!industry) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 mb-4 md:mb-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <button onClick={() => router.back()} className="hover:text-gold transition-colors flex items-center gap-1.5">
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        <span className="opacity-50">/</span>
        <span className="text-gold">Step 02</span>
        <span className="opacity-50">/</span>
        <span>Infrastructure Setup</span>
      </div>

      <div className="mb-5 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 leading-tight">
          Initialize{" "}
          <span className="text-gold-gradient">Your Workspace</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-lg">
          Personalize your organization structure. We&apos;ve suggested a blueprint based on your industry selection.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-4 md:space-y-5">
        {/* Org name */}
        <div className="glass rounded-[1.25rem] md:rounded-[1.5rem] border border-white/5 p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-gold rounded-full" />
            <h2 className="font-black text-white uppercase tracking-widest text-[10px] md:text-[11px]">Identity</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="orgName" className="text-[11px] md:text-xs font-bold text-white/50 ml-1">
              Organization / business name
            </Label>
            <Input
              id="orgName"
              placeholder="e.g. Downtown Bistro..."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="h-11 md:h-12 bg-white/5 border-white/10 rounded-xl md:rounded-2xl focus:ring-gold/50 focus:border-gold/50 text-base px-4"
            />
          </div>
        </div>

        {/* Departments */}
        <div className="glass rounded-[1.25rem] md:rounded-[1.5rem] border border-white/5 p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-gold rounded-full" />
              <h2 className="font-black text-white uppercase tracking-widest text-[10px] md:text-[11px]">Departments</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addDept}
              className="text-gold hover:text-gold hover:bg-gold/10 font-bold text-[9px] md:text-[10px] uppercase tracking-widest px-2 md:px-3"
            >
              <Plus className="w-3 h-3 mr-1.5" />
              <span className="hidden sm:inline">Add Department</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>

          <div className="grid gap-2.5">
            {departments.map((dept, i) => (
              <div
                key={`${dept.color}-${i}`}
                className={cn(
                  "flex items-center gap-3 border p-3.5 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 group",
                  "bg-white/[0.02] border-white/5 hover:border-gold/30 hover:bg-gold/[0.04]"
                )}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.4)]"
                  style={{ backgroundColor: dept.color }}
                />
                <Input
                  value={dept.name}
                  onChange={(e) => updateDeptName(i, e.target.value)}
                  placeholder="Department name"
                  className="bg-transparent border-none focus:ring-0 p-0 text-sm md:text-base font-semibold placeholder:text-white/10 h-auto"
                />
                <button
                  type="button"
                  onClick={() => removeDept(i)}
                  className="text-white/20 hover:text-red-400 transition-colors p-1.5 shrink-0"
                  aria-label="Remove department"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-1">
            Additional departments can be configured in Settings later.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between mt-2 md:mt-4 pt-5 border-t border-white/5 gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest"
          >
            Previous Step
          </Button>
          <Button
            type="submit"
            className="h-12 px-8 btn-gold rounded-full text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-gold/20 active:scale-95 transition-all"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
      <Link href="/onboarding/invite" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
