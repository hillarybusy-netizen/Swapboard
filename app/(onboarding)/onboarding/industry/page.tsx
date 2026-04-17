"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { INDUSTRY_TEMPLATES } from "@/lib/industry-templates";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight } from "lucide-react";

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
      {/* Progress */}
      <div className="flex items-center gap-3 mb-12 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        <span className="text-gold">Step 01</span>
        <span className="opacity-50">/</span>
        <span>Define your Domain</span>
      </div>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-white mb-4 leading-tight">
          What is your <br />
          <span className="text-gold-gradient">Service Industry?</span>
        </h1>
        <p className="text-white/40 text-sm font-medium max-w-lg">
          We&apos;ll pre-configure your intelligent workspace with optimized departments and roles tailored to your specific operational needs.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(INDUSTRY_TEMPLATES)
          .filter(([key]) => ["restaurant", "healthcare", "retail"].includes(key))
          .map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "text-left p-8 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group",
                selected === key 
                  ? "glass border-gold bg-gold/[0.03] shadow-[0_0_40px_rgba(212,175,55,0.05)]" 
                  : "glass border-white/5 hover:border-white/10"
              )}
            >
              {selected === key && (
                <div className="absolute top-6 right-6 w-6 h-6 rounded-full bg-gold flex items-center justify-center animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-4 h-4 text-[#050505]" />
                </div>
              )}
              
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">{tmpl.icon}</div>
              <h3 className="font-black text-xl text-white mb-2 tracking-tight group-hover:text-gold transition-colors">{tmpl.label}</h3>
              <p className="text-xs text-white/30 font-medium mb-6 leading-relaxed line-clamp-2">{tmpl.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {tmpl.departments.slice(0, 3).map((d) => (
                  <span key={d.name} className="text-[9px] font-black uppercase tracking-widest bg-white/5 text-white/40 px-3 py-1 rounded-full border border-white/5">
                    {d.name}
                  </span>
                ))}
                {tmpl.departments.length > 3 && (
                  <span className="text-[9px] font-bold text-white/20 flex items-center ml-1">+{tmpl.departments.length - 3}</span>
                )}
              </div>
            </button>
          ))}
      </div>

      <div className="flex justify-end mt-16 pt-12 border-t border-white/5">
        <Button 
          onClick={handleNext} 
          disabled={!selected} 
          className="h-14 px-8 btn-gold rounded-full text-sm font-black uppercase tracking-widest gap-3 shadow-2xl shadow-gold/20 disabled:opacity-20 translate-y-0 active:scale-95 transition-all"
        >
          Continue Build <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <Link href="/onboarding/setup" prefetch className="hidden" aria-hidden tabIndex={-1} />
    </div>
  );
}
