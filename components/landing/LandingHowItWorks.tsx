"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeUpOnScroll, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: "01",
    title: "Set up your org",
    desc: "Choose your industry, add departments, and invite your team in minutes.",
    image: "/landing/office-planning.jpg",
  },
  {
    step: "02",
    title: "Workers request swaps",
    desc: "Staff post swap requests from their phone. Qualified colleagues can accept instantly.",
    image: "/landing/mobile-shift.jpg",
  },
  {
    step: "03",
    title: "Managers approve",
    desc: "One tap to approve. The schedule updates automatically for everyone in real-time.",
    image: "/landing/manager-team.jpg",
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

        {/* Interactive step tabs — mobile friendly */}
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
            {STEPS.map((s, i) => (
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
                  <div className="relative mb-6 sm:mb-8">
                    <motion.div
                      className="relative w-full max-w-[224px] h-28 sm:h-32 md:w-56 md:h-36 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
                      animate={
                        active === i
                          ? { boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(212,175,55,0.1)" }
                          : { boxShadow: "0 15px 30px rgba(0,0,0,0.4)" }
                      }
                    >
                      <Image src={s.image} alt={s.title} fill className="object-cover" sizes="224px" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/70 via-transparent to-transparent" />
                    </motion.div>
                    <motion.div
                      className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full glass flex items-center justify-center text-sm md:text-lg font-black text-gold shadow-xl shadow-gold/5 border border-gold/20"
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
            ))}
          </StaggerContainer>
        </div>
      </FadeUpOnScroll>
    </section>
  );
}
