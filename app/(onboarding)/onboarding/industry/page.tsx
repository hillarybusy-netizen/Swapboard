"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INDUSTRY_TEMPLATES } from "@/lib/industry-templates";
import { IndustryIcon, type IndustryIconKey } from "@/components/onboarding/IndustryIcon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight } from "lucide-react";

const VISIBLE_INDUSTRIES: IndustryIconKey[] = ["restaurant", "healthcare", "retail"];

export default function IndustryPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  function handleNext() {
    if (!selected) return;
    sessionStorage.setItem("onboarding_industry", selected);
    router.push("/onboarding/setup");
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 mb-4 md:mb-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <span className="text-gold">Step 01</span>
        <span className="opacity-50">/</span>
        <span>Define your Domain</span>
      </div>

      <div className="mb-5 md:mb-6">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-2 leading-tight">
          What is your{" "}
          <span className="text-gold-gradient">Service Industry?</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-lg">
          We&apos;ll pre-configure your workspace with departments tailored to your industry.
        </p>
      </div>

      <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VISIBLE_INDUSTRIES.map((key) => {
          const tmpl = INDUSTRY_TEMPLATES[key];
          const isSelected = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={cn(
                "text-left p-5 md:p-6 rounded-[1.25rem] md:rounded-[1.5rem] border transition-all duration-300 relative overflow-hidden group",
                isSelected
                  ? "glass border-gold/60 bg-gold/[0.06] shadow-[0_0_32px_rgba(212,175,55,0.1)]"
                  : "glass border-white/5 hover:border-gold/40 hover:bg-gold/[0.05] hover:shadow-[0_0_24px_rgba(212,175,55,0.08)] hover:-translate-y-0.5"
              )}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gold flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-[#050505]" />
                </div>
              )}

              <div
                className={cn(
                  "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 border transition-colors duration-300",
                  isSelected
                    ? "bg-gold/15 border-gold/30 text-gold"
                    : "bg-gold/5 border-gold/15 text-gold/70 group-hover:bg-gold/10 group-hover:border-gold/30 group-hover:text-gold"
                )}
              >
                <IndustryIcon type={key} />
              </div>

              <h3
                className={cn(
                  "font-black text-lg text-white mb-1.5 tracking-tight transition-colors duration-300",
                  !isSelected && "group-hover:text-gold"
                )}
              >
                {tmpl.label}
              </h3>
              <p className="text-xs text-white/30 font-medium mb-4 leading-relaxed line-clamp-2">
                {tmpl.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {tmpl.departments.slice(0, 3).map((d) => (
                  <span
                    key={d.name}
                    className="text-[9px] font-black uppercase tracking-widest bg-white/5 text-white/40 px-2.5 py-1 rounded-full border border-white/5 transition-colors duration-300 group-hover:border-gold/20 group-hover:text-white/50"
                  >
                    {d.name}
                  </span>
                ))}
                {tmpl.departments.length > 3 && (
                  <span className="text-[9px] font-bold text-white/20 flex items-center">
                    +{tmpl.departments.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between mt-6 md:mt-8 pt-5 border-t border-white/5 gap-4">
        <p className="text-[11px] font-medium text-white/30 italic">
          * More industries coming soon.
        </p>
        <Button
          onClick={handleNext}
          disabled={!selected}
          className="h-12 px-8 btn-gold rounded-full text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-gold/20 disabled:opacity-20 active:scale-95 transition-all"
        >
          Continue Build <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <Link href="/onboarding/setup" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
