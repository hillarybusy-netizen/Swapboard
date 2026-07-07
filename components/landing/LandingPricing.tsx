"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { StaggerContainer, StaggerItem, ScaleOnScroll } from "@/components/animations/ScrollAnimations";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$79",
    annualPrice: "$59",
    desc: "Perfect for single-location businesses",
    features: ["Up to 100 workers", "3 departments", "Basic analytics", "Email support"],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$199",
    annualPrice: "$149",
    desc: "For growing multi-department teams",
    features: ["Up to 200 workers", "Unlimited departments", "ROI analytics", "Priority support", "Custom roles"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$499",
    annualPrice: "$374",
    desc: "For large organisations",
    features: ["Unlimited workers", "Multi-location", "Advanced analytics", "Dedicated support", "SSO & compliance"],
    highlighted: false,
  },
];

export function LandingPricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex justify-center mb-12">
        <div className="glass p-1 rounded-full inline-flex items-center gap-1 border border-white/10 relative">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all relative z-10",
              !isAnnual ? "text-[#050505]" : "text-white/50 hover:text-white"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all relative z-10 flex items-center gap-2",
              isAnnual ? "text-[#050505]" : "text-white/50 hover:text-white"
            )}
          >
            Annually
             <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider",
                isAnnual ? "bg-[#050505]/20 text-[#050505]" : "bg-gold/20 text-gold"
              )}
            >
              Save 25%
            </span>
          </button>

          {/* Animated slider background */}
          <div
            className={cn(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gold rounded-full transition-all duration-300 ease-out z-0",
              isAnnual ? "translate-x-full" : "translate-x-0"
            )}
            style={{ width: isAnnual ? "142px" : "100px", left: "4px" }}
          />
        </div>
      </div>

      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {plans.map((plan) => (
          <StaggerItem key={plan.name}>
            <ScaleOnScroll>
              <div
                className={`relative rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-10 flex flex-col h-full ${
                  plan.highlighted
                    ? "glass shadow-2xl shadow-gold/10 border-gold/40 lg:scale-105 z-10"
                    : "card-premium lg:opacity-80"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gold text-[#050505] text-[10px] font-black uppercase tracking-widest">
                    Most popular
                  </div>
                )}
                <div className="flex justify-between items-start mb-2 h-8">
                  <h3 className="font-bold text-2xl">{plan.name}</h3>
                  {isAnnual && (
                    <div className="bg-gold/10 text-gold text-[9px] font-bold px-1.5 py-0.5 rounded border border-gold/20">
                      Save 25%
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 mb-6">
                  <div className="flex items-baseline gap-2 min-h-[48px]">
                    {isAnnual && (
                      <span className="text-2xl font-bold text-white/30 line-through decoration-white/30">
                        {plan.price}
                      </span>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-gold">
                        {isAnnual ? plan.annualPrice : plan.price}
                      </span>
                      <span className="text-white/30 font-medium">/mo</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-white/40 font-medium tracking-wide">
                    {isAnnual ? "Billed annually" : "Billed monthly"}
                  </span>
                </div>
                <p className="text-sm text-white/50 mb-10 font-medium min-h-[40px]">{plan.desc}</p>
                <div className="h-[2px] w-full bg-white/5 mb-10" />
                <ul className="space-y-4 mb-12 flex-grow">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm font-medium text-white/60">
                      <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-gold" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboarding/industry"
                  className={`block text-center py-4 rounded-full text-base font-bold transition-all ${
                    plan.highlighted ? "btn-gold" : "glass hover:bg-white/5 text-white/80"
                  }`}
                >
                  Start your trial
                </Link>
              </div>
            </ScaleOnScroll>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}
