"use client";

import Link from "next/link";
import Image from "next/image";
import { Gift, CalendarDays } from "lucide-react";
import { DEMO_HREF } from "@/lib/contact";
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
      className="relative min-h-[88svh] flex items-center pt-28 sm:pt-32 pb-20 sm:pb-24 px-4 sm:px-6 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing/workers_together.png"
          alt="Workers together"
          fill
          priority
          className="object-cover opacity-50"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/65 to-[#050505] z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_0%,#050505_100%)] opacity-70 z-[1]" />

      <div className="relative z-[3] w-full max-w-4xl mx-auto">
        <div className="text-center w-full">
          <FadeUpOnScroll>
            <h1 className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tight mb-6 sm:mb-7 leading-[1.04]">
              <span className="text-white">24/7 </span>
              <span className="text-white/55 font-light">shift coverage </span>
              <br className="hidden sm:block" />
              <span className="text-white">on </span>
              <span className="text-gold-gradient">autopilot.</span>
            </h1>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={0.1}>
            <p className="text-base md:text-lg text-white/60 max-w-xl mx-auto mb-9 sm:mb-10 leading-relaxed font-body">
              Get started in under 3 minutes. Eliminate last-minute callouts and let your team trade shifts instantly without any coordination chaos.
            </p>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={0.2}>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              {user ? (
                <Link
                  href="/dashboard"
                  className="btn-gold flex items-center justify-center gap-2 px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold w-full sm:w-auto"
                >
                  Log back into {orgName || "your"} dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/onboarding/industry"
                    className="btn-gold flex items-center justify-center gap-2 px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold w-full sm:w-auto"
                  >
                    Get started instantly
                  </Link>
                  <a
                    href={DEMO_HREF}
                    className="flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold w-full sm:w-auto border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/25 transition-colors backdrop-blur-sm"
                  >
                    <CalendarDays className="w-4 h-4 text-gold" />
                    Book a demo
                  </a>
                  <Link
                    href="/onboarding/industry"
                    className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-gold/80 hover:text-gold transition-colors py-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>14-day free trial included</span>
                  </Link>
                  <Link
                    href="/login"
                    className="sm:hidden text-[11px] font-bold tracking-wide text-white/60 hover:text-gold transition-colors"
                  >
                    Already swapping? <span className="text-gold">Log in now</span>
                  </Link>
                </>
              )}
            </div>
          </FadeUpOnScroll>

          <FadeUpOnScroll delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Trusted by</span>
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white/60"
                >
                  {badge}
                </span>
              ))}
            </div>
          </FadeUpOnScroll>
        </div>
      </div>
    </section>
  );
}
