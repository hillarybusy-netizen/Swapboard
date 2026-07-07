"use client";

import { motion } from "framer-motion";
import { LandingWorkerDashboardMock } from "@/components/landing/LandingWorkerDashboardMock";


export function LandingHeroPreview() {
  return (
    <motion.div
      className="relative w-full max-w-4xl mx-auto lg:mx-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -inset-4 sm:-inset-6 bg-gold/8 blur-3xl rounded-[2rem] -z-10" />

      {/* Scaled frame — interior is full worker dashboard at 1080px */}
      <div
        className="relative overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/60 bg-[#050505] w-full"
        style={{ height: "clamp(380px, 52vw, 560px)" }}
      >
        <div className="w-full h-full">
          <LandingWorkerDashboardMock />
        </div>

        {/* Subtle edge fade so crop feels intentional */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050505] to-transparent" />
      </div>
    </motion.div>
  );
}
