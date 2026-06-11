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
    stiffness: 120,
    damping: 28,
    mass: 0.6,
  });

  // --- Derived motion values ---

  // Nav container: from full-width to a centered pill
  const navWidth = useTransform(scrollProgress, [0, 1], ["92%", "fit-content"]);
  const navMaxWidth = useTransform(scrollProgress, [0, 1], ["1280px", "680px"]);
  const navTop = useTransform(scrollProgress, [0, 1], ["1.5rem", "1rem"]);
  const navPaddingX = useTransform(scrollProgress, [0, 1], ["0rem", "1.5rem"]);
  const navHeight = useTransform(scrollProgress, [0, 1], ["5rem", "3.5rem"]);

  // Gap between left/center/right sections collapses as sections converge
  const sectionGap = useTransform(scrollProgress, [0, 1], ["3rem", "0rem"]);

  // Left section: shifts from full-flex to auto
  const leftFlex = useTransform(scrollProgress, [0, 1], [1, 0]);

  // Right section: same as left
  const rightFlex = useTransform(scrollProgress, [0, 1], [1, 0]);

  // Nav link gap collapses
  const linkGap = useTransform(scrollProgress, [0, 1], ["2.5rem", "1.5rem"]);

  // The pill background: starts invisible, grows organically from center
  // Border-radius always 9999px (pill shape)
  const bgOpacity = useTransform(scrollProgress, [0, 1], [0, 1]);
  const bgScaleX = useTransform(scrollProgress, [0, 0.4, 1], [0.05, 0.5, 1]);
  const bgScaleY = useTransform(scrollProgress, [0, 0.3, 1], [0.3, 0.75, 1]);
  const bgBlur = useTransform(scrollProgress, (v) => `blur(${v * 55}px) saturate(${100 + v * 140}%)`);
  const bgBg = useTransform(scrollProgress, (v) => `rgba(10,10,10,${v * 0.85})`);
  const bgBorder = useTransform(scrollProgress, (v) => `rgba(255,255,255,${v * 0.1})`);
  const bgShadow = useTransform(
    scrollProgress,
    (v) =>
      `inset 0 1.5px 1.5px 0 rgba(255,255,255,${v * 0.18}), 0 12px 40px 0 rgba(0,0,0,${v * 0.6})`
  );

  // Logo text fade out on mobile when scrolled
  const logoTextOpacity = useTransform(scrollProgress, [0.5, 1], [1, 0]);
  const logoTextMaxWidth = useTransform(scrollProgress, [0.5, 1], ["120px", "0px"]);

  if (!mounted) {
    return (
      <nav
        className="fixed top-6 inset-x-0 mx-auto z-50 flex items-center justify-center"
        style={{ width: "92%", maxWidth: "1280px", height: "5rem" }}
      >
        {/* invisible bg placeholder */}
        <div className="absolute inset-0 rounded-full pointer-events-none" style={{ opacity: 0 }} />
        <div className="flex items-center w-full" style={{ gap: "3rem" }}>
          <div className="flex-1 flex justify-start z-10">
            <AnimatedLogo size="sm" showText={true} />
          </div>
          <div className="hidden md:flex items-center z-10" style={{ gap: "2.5rem" }}>
            <a href="#features" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">Features</a>
            <a href="#how-it-works" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">How it works</a>
            <a href="#pricing" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">Pricing</a>
            <a href="#faq" className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">FAQ</a>
          </div>
          <div className="flex-1 flex justify-end items-center gap-4 z-10">
            <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="btn-gold px-5 py-2 rounded-full text-sm font-bold">Try free</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav
      className="fixed inset-x-0 mx-auto z-50 flex items-center justify-center"
      style={{
        width: navWidth,
        maxWidth: navMaxWidth,
        top: navTop,
        height: navHeight,
        paddingLeft: navPaddingX,
        paddingRight: navPaddingX,
      }}
    >
      {/* ── Organic growing pill background ── */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          opacity: bgOpacity,
          scaleX: bgScaleX,
          scaleY: bgScaleY,
          background: bgBg,
          WebkitBackdropFilter: bgBlur,
          backdropFilter: bgBlur,
          borderWidth: "1.5px",
          borderStyle: "solid",
          borderColor: bgBorder,
          boxShadow: bgShadow,
          transformOrigin: "center center",
        }}
      />

      {/* ── Inner flex row: the three sections ── */}
      <motion.div
        className="flex items-center w-full"
        style={{ gap: sectionGap }}
      >
        {/* Left: Logo */}
        <motion.div
          className="flex justify-start z-10 shrink-0"
          style={{ flex: leftFlex, minWidth: 0 }}
        >
          <div className="flex items-center gap-3">
            <AnimatedLogo size="sm" showText={false} />
            {/* Logo text — hidden on mobile as pill shrinks */}
            <motion.span
              className="font-bold tracking-tighter text-white text-base overflow-hidden whitespace-nowrap hidden sm:inline-block"
              style={{
                opacity: logoTextOpacity,
                maxWidth: logoTextMaxWidth,
              }}
            >
              Swap<span className="text-gold">Board</span>
            </motion.span>
          </div>
        </motion.div>

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
        <motion.div
          className="flex justify-end items-center gap-4 z-10 shrink-0"
          style={{ flex: rightFlex, minWidth: 0 }}
        >
          {user ? (
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
        </motion.div>
      </motion.div>
    </motion.nav>
  );
}
