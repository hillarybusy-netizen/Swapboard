"use client";

import { motion } from "framer-motion";
import { LandingWorkerDashboardMock } from "@/components/landing/LandingWorkerDashboardMock";

export function LandingHeroPreview() {
  return (
    <motion.div
      className="relative w-full"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >

      {/* Label row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-gold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span>Interactive Live Demo</span>
        </div>
        <span className="text-[10px] font-bold text-white/45 hidden sm:inline">
          Click tabs · scroll up/down
        </span>
      </div>

      {/* Responsive frame — taller on desktop, compact on mobile */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-2xl border border-white/12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] bg-[#050505] ring-1 ring-black/50 w-full h-[560px] sm:h-[620px] lg:h-[680px]">
        <LandingWorkerDashboardMock />
      </div>
    </motion.div>
  );
}
