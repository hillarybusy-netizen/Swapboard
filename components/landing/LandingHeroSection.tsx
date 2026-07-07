"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gift, Infinity as InfinityIcon } from "lucide-react";
import { LandingHeroPreview } from "@/components/landing/LandingHeroPreview";
import { FadeUpOnScroll } from "@/components/animations/ScrollAnimations";

interface LandingHeroSectionProps {
  user: { id: string } | null;
  orgName?: string | null;
}

const TRUST_BADGES = ["Restaurants", "Healthcare", "Retail", "Hospitality"];

export function LandingHeroSection({ user, orgName }: LandingHeroSectionProps) {
  return (
    <section
      data-hero-section
      className="relative pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-20 md:pb-32 lg:min-h-screen lg:flex lg:items-center px-4 sm:px-6 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing/workers_together.png"
          alt="Workers together"
          fill
          priority
          className="object-cover opacity-70 scale-110 animate-ken-burns"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-[#050505]/55 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/70 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-[#050505]/40 z-[1]" />

      <div className="absolute top-20 left-[10%] w-72 h-72 bg-gold/15 rounded-full blur-[100px] animate-aurora z-[2]" />
      <div className="absolute bottom-32 right-[5%] w-96 h-96 bg-gold/8 rounded-full blur-[120px] animate-aurora-delayed z-[2]" />

      <div className="absolute inset-0 noise-overlay z-[2] pointer-events-none" />

      <div className="relative z-[3] w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 pt-6 sm:pt-10">
        <div className="flex-1 text-center lg:text-left lg:pl-4 xl:pl-12 w-full">
          <FadeUpOnScroll>
            <h1 className="text-[1.75rem] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-6xl font-display font-bold tracking-tight mb-6 sm:mb-8 leading-[1.12] md:leading-[1.05]">
              <span className="text-white">Create </span>
              <span className="text-white/40 font-light">a system </span>
              <span className="text-white">of stable </span>
              <span className="inline-flex items-center justify-center bg-gold/10 border border-gold/30 rounded-xl p-1.5 mx-0.5 sm:mx-2 align-middle">
                <InfinityIcon className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </span>
              <span className="text-white">coverage </span>
              <span className="text-white/40 font-light">where staff </span>
              <span className="text-white">trade shifts </span>
              <span className="text-white">for </span>
              <span className="text-gold-gradient block sm:inline mt-1 sm:mt-0">your business 24/7</span>
            </h1>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={0.1}>
            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-10 leading-relaxed font-body font-medium">
              Get started in under 3 minutes. Eliminate last-minute callouts and let your team trade shifts instantly without any coordination chaos.
            </p>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-8 sm:mb-10">
              {user ? (
                <Link
                  href="/dashboard"
                  className="btn-gold btn-shine flex items-center justify-center gap-2 px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold w-full sm:w-auto shadow-2xl shadow-gold/20"
                >
                  Log back into {orgName || "your"} dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-gold btn-shine flex items-center justify-center gap-2 px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold w-full sm:w-auto shadow-2xl shadow-gold/20"
                  >
                    Get started instantly
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-gold/80 hover:text-gold transition-colors py-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>14-day free trial included</span>
                  </Link>
                </>
              )}
            </div>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={0.3}>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Trusted by</span>
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/8 text-[10px] font-semibold text-white/40"
                >
                  {badge}
                </span>
              ))}
            </div>
          </FadeUpOnScroll>
        </div>

        <div className="flex-1 w-full lg:max-w-[600px] xl:max-w-[640px]">
          <LandingHeroPreview />
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[3] hidden lg:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Scroll</span>
        <motion.div
          className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-2 rounded-full bg-gold/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
