"use client";

import Link from "next/link";
import { useScroll, useTransform, useSpring, motion, useMotionValueEvent } from "framer-motion";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { LandingProfileDropdown } from "@/components/layout/LandingProfileDropdown";
import { useEffect, useRef, useState } from "react";

interface LandingNavbarProps {
  user: any;
  logoUrl?: string | null;
  initials: string;
}

export function LandingNavbar({ user, logoUrl, initials }: LandingNavbarProps) {
  const { scrollY } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [heroHeight, setHeroHeight] = useState(600);

  useEffect(() => {
    setMounted(true);
    // Measure the hero section to know when it leaves the viewport
    const heroEl = document.querySelector("[data-hero-section]") as HTMLElement;
    if (heroEl) {
      setHeroHeight(heroEl.offsetHeight);
      const ro = new ResizeObserver(() => setHeroHeight(heroEl.offsetHeight));
      ro.observe(heroEl);
      return () => ro.disconnect();
    }
  }, []);

  // Raw scroll progress: 0 when hero visible, 1 when hero has scrolled away
  // Starts at 80px offset so animation begins a little before the hero leaves
  const scrollRange = mounted ? [80, Math.max(heroHeight - 120, 200)] : [80, 500];
  const rawProgress = useTransform(scrollY, scrollRange, [0, 1], { clamp: true });

  // Spring-smooth the progress for organic feel
  const scrollProgress = useSpring(rawProgress, {
    stiffness: 200,
    damping: 35,
    mass: 0.5,
  });

  // Nav container: 100% wide (max 1280px) at the top, compresses to 92% wide (max 680px) as you scroll
  const navWidth = useTransform(scrollProgress, [0, 1], ["100%", "92%"]);
  const navMaxWidth = useTransform(scrollProgress, [0, 1], ["1280px", "680px"]);
  // Starts flush at the top or slightly padded, detaches to floating at 1rem
  const navTop = useTransform(scrollProgress, [0, 1], ["0rem", "1rem"]);
  const navPaddingX = useTransform(scrollProgress, [0, 1], ["1.5rem", "1.25rem"]);

  // The pill background: completely invisible at the top, fades in as the container shrinks
  const bgOpacity = useTransform(scrollProgress, [0, 0.15, 1], [0, 0.8, 1]);
  // Border radius transitions from flat (0px) to pill (9999px)
  const bgRadius = useTransform(scrollProgress, [0, 1], ["0px", "9999px"]);

  // Elements spacing: compress as it becomes a pill
  const linkGap = useTransform(scrollProgress, [0, 1], ["2.5rem", "1.5rem"]);

  if (!mounted) {
    return (
      <nav
        className="fixed top-0 inset-x-0 mx-auto z-50 flex items-center justify-center w-full max-w-[1280px] h-[5rem] px-6"
      >
        <div className="flex items-center w-full justify-between">
          <div className="flex justify-start z-10 shrink-0">
            <AnimatedLogo size="md" showText={true} />
          </div>
          <div className="hidden md:flex items-center z-10 gap-10">
            <a href="#features" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">Features</a>
            <a href="#how-it-works" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">How it works</a>
            <a href="#pricing" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">Pricing</a>
            <a href="#faq" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">FAQ</a>
          </div>
          <div className="flex justify-end items-center gap-4 z-10 shrink-0">
            {user && initials ? (
              <div className="flex items-center hover:scale-105 transition-transform cursor-pointer">
                <LandingProfileDropdown logoUrl={logoUrl} initials={initials} />
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Sign in</Link>
                <Link href="/register" className="btn-gold px-5 py-2 rounded-full text-sm font-bold">Try free</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav
      className="fixed inset-x-0 mx-auto z-50 flex items-center justify-center h-[4.5rem]"
      style={{
        width: navWidth,
        maxWidth: navMaxWidth,
        top: navTop,
        paddingLeft: navPaddingX,
        paddingRight: navPaddingX,
      }}
    >
      {/* ── Organic background ── 
          Fades in and rounds its corners as the container compresses 
      */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none glass-nav"
        style={{
          opacity: bgOpacity,
          borderRadius: bgRadius,
        }}
      />

      {/* ── Inner flex row ── */}
      <motion.div
        className="flex items-center w-full justify-between"
      >
        {/* Left: Logo */}
        <div className="flex justify-start items-center z-10 shrink-0">
          <AnimatedLogo size="md" showText={false} />
        </div>

        {/* Center: Nav links */}
        <motion.div
          className="hidden md:flex items-center z-10 shrink-0"
          style={{ gap: linkGap }}
        >
          <a href="#features" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors whitespace-nowrap">Features</a>
          <a href="#how-it-works" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors whitespace-nowrap">How it works</a>
          <a href="#pricing" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors whitespace-nowrap">Pricing</a>
          <a href="#faq" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors whitespace-nowrap">FAQ</a>
        </motion.div>

        {/* Right: Actions */}
        <div className="flex justify-end items-center gap-4 z-10 shrink-0">
          {user && initials ? (
            <div className="flex items-center hover:scale-105 transition-transform cursor-pointer">
              <LandingProfileDropdown logoUrl={logoUrl} initials={initials} />
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors whitespace-nowrap">
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-gold px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap"
              >
                Try free
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
}
