"use client";

import { motion } from "framer-motion";
import { LandingWorkerDashboardMock } from "@/components/landing/LandingWorkerDashboardMock";

export function LandingHeroPreview() {
  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -inset-4 sm:-inset-6 bg-gold/8 blur-3xl rounded-[2rem] -z-10" />

      {/* Label row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-black uppercase tracking-widest text-gold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span>Interactive Live Demo</span>
        </div>
        <span className="text-[10px] font-bold text-white/30 hidden sm:inline">
          Click tabs · scroll up/down
        </span>
      </div>

      {/* Responsive frame — taller on desktop, compact on mobile */}
      <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-white/15 shadow-2xl shadow-black/80 bg-[#050505] w-full h-[520px] sm:h-[580px] md:h-[620px] lg:h-[600px] xl:h-[640px]">
        <LandingWorkerDashboardMock />
      </div>
    </motion.div>
  );
}
