"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FadeUpOnScroll, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { cn } from "@/lib/utils";
import { Building2, ArrowLeftRight, CheckCircle2, Users, Bell, Sparkles, Check, Clock } from "lucide-react";

function StepSetupVisual() {
  return (
    <div className="w-full h-full p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#141418] to-[#0a0a0c] text-left select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-gold" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Harbor Kitchen</span>
        </div>
        <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          3 Depts
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 my-auto">
        <span className="px-2 py-1 rounded-lg bg-gold/15 text-gold text-[9px] font-bold border border-gold/30">
          Floor (14)
        </span>
        <span className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-[9px] font-bold border border-white/10">
          Kitchen (8)
        </span>
        <span className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-[9px] font-bold border border-white/10">
          Bar (6)
        </span>
      </div>

      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
        <span className="text-[9px] font-mono text-white/40 truncate">swapboard.ca/join/harbor</span>
        <span className="text-[8px] font-bold text-gold uppercase tracking-wider flex items-center gap-1 shrink-0 ml-1">
          <Check className="w-2.5 h-2.5" /> Invite Sent
        </span>
      </div>
    </div>
  );
}

function StepSwapVisual() {
  return (
    <div className="w-full h-full p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#141418] to-[#0a0a0c] text-left select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gold/80" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Fri, Jul 11</span>
        </div>
        <span className="text-[8px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          6 PM – 2 AM
        </span>
      </div>

      <div className="px-2.5 py-2 rounded-xl bg-gold/[0.05] border border-gold/20 my-auto">
        <p className="text-[10px] font-black text-white">Friday Dinner Floor</p>
        <p className="text-[8px] text-white/40 mt-0.5">Alex R. requesting coverage</p>
      </div>

      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gold text-[#050505] font-black text-[9px] uppercase tracking-wider shadow-sm">
        <span className="flex items-center gap-1">
          <ArrowLeftRight className="w-3 h-3" /> Post for Swap
        </span>
        <span className="text-[8px] font-bold opacity-80">8 Notified</span>
      </div>
    </div>
  );
}

function StepApproveVisual() {
  return (
    <div className="w-full h-full p-3.5 flex flex-col justify-between bg-gradient-to-b from-[#141418] to-[#0a0a0c] text-left select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Manager Action</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 my-auto">
        <div className="flex items-center justify-between text-[9px] font-bold">
          <span className="text-white">Alex R.</span>
          <span className="text-gold">⇄</span>
          <span className="text-emerald-400">James K.</span>
        </div>
        <p className="text-[8px] text-white/30 text-center mt-0.5">Zero overtime conflict</p>
      </div>

      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-[9px] uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Check className="w-3 h-3" /> 1-Tap Approved
        </span>
        <span className="text-[8px] text-emerald-400 font-bold">Roster Synced</span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    step: "01",
    title: "Set up your org",
    desc: "Choose your industry, add departments, and invite your team in minutes.",
    label: "Invite your team",
    Visual: StepSetupVisual,
  },
  {
    step: "02",
    title: "Workers request swaps",
    desc: "Staff post swap requests from their phone. Qualified colleagues can accept instantly.",
    label: "Request from phone",
    Visual: StepSwapVisual,
  },
  {
    step: "03",
    title: "Managers approve",
    desc: "One tap to approve. The schedule updates automatically for everyone in real-time.",
    label: "Approve in one tap",
    Visual: StepApproveVisual,
  },
] as const;

export function LandingHowItWorks() {
  const [active, setActive] = useState(0);

  return (
    <section id="how-it-works" className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#06080c]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gold/[0.04] blur-[150px] -z-10" />
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-50" />

      <FadeUpOnScroll className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 tracking-tight px-2">
          Up and running in <br />
          <span className="text-gold-gradient">3 simple steps</span>
        </h2>
        <p className="text-white/40 text-sm sm:text-base font-medium mb-12 sm:mb-20 max-w-lg mx-auto">
          From signup to first swap in under 3 minutes. No training manuals required.
        </p>

        <div className="flex justify-center gap-2 sm:gap-3 mb-10 sm:mb-16 flex-wrap">
          {STEPS.map((s, i) => (
            <button
              key={s.step}
              onClick={() => setActive(i)}
              className={cn(
                "px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300",
                active === i
                  ? "bg-gold text-[#050505] shadow-lg shadow-gold/20"
                  : "glass text-white/50 hover:text-white border border-white/10"
              )}
            >
              Step {s.step}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent -z-10" />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            {STEPS.map((s, i) => {
              const VisualComponent = s.Visual;
              return (
                <StaggerItem key={s.step}>
                  <motion.div
                    className={cn(
                      "flex flex-col items-center transition-opacity duration-500",
                      active !== i && "md:opacity-40 md:scale-[0.98]",
                      active === i && "opacity-100"
                    )}
                    onMouseEnter={() => setActive(i)}
                    animate={active === i ? { scale: 1 } : { scale: 0.98 }}
                  >
                    <div className="relative mb-6 sm:mb-8 w-full max-w-[240px] md:max-w-[260px]">
                      <motion.div
                        className="relative w-full h-32 sm:h-36 md:h-40 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-[#0a0a0c]"
                        animate={
                          active === i
                            ? { boxShadow: "0 25px 50px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.3)" }
                            : { boxShadow: "0 15px 30px rgba(0,0,0,0.4)" }
                        }
                      >
                        <VisualComponent />
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-xs md:text-sm font-black text-gold shadow-xl shadow-gold/5 border border-gold/30 z-20"
                        animate={active === i ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      >
                        {s.step}
                      </motion.div>
                    </div>
                    <h3 className="font-bold text-lg md:text-2xl mb-2 md:mb-4 tracking-tight mt-4 sm:mt-6">{s.title}</h3>
                    <p className="text-xs md:text-base text-white/50 leading-relaxed font-medium max-w-xs">{s.desc}</p>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </FadeUpOnScroll>
    </section>
  );
}
