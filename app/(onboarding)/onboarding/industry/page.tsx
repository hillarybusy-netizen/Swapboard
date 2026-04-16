"use client";
import { useState } from "react";
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
    <div>
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
        <span className="font-semibold text-primary">Step 1</span>
        <span>/</span>
        <span>3 — Choose your industry</span>
      </div>

      <h1 className="text-3xl font-bold mb-2">What type of business are you?</h1>
      <p className="text-muted-foreground mb-8">
        We&apos;ll pre-configure departments and roles based on your industry.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(INDUSTRY_TEMPLATES)
          .filter(([key]) => ["restaurant", "healthcare", "retail"].includes(key))
          .map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "text-left p-6 rounded-xl border-2 bg-white transition-all hover:shadow-md relative",
                selected === key ? "border-primary shadow-md" : "border-border hover:border-primary/50"
              )}
            >
              {selected === key && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
              )}
              <div className="text-3xl mb-3">{tmpl.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{tmpl.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{tmpl.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {tmpl.departments.slice(0, 3).map((d) => (
                  <span key={d.name} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                    {d.name}
                  </span>
                ))}
                {tmpl.departments.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{tmpl.departments.length - 3} more</span>
                )}
              </div>
            </button>
          ))}
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleNext} disabled={!selected} size="lg">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
