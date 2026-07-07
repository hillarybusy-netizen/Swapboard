"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { LandingProfileDropdown } from "@/components/layout/LandingProfileDropdown";

interface LandingNavbarProps {
  user: any;
  logoUrl?: string | null;
  initials: string;
  orgName?: string | null;
}

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNavbar({ user, logoUrl, initials, orgName }: LandingNavbarProps) {
  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [heroHeight, setHeroHeight] = useState(600);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const heroEl = document.querySelector("[data-hero-section]") as HTMLElement;
    if (heroEl) {
      setHeroHeight(heroEl.offsetHeight);
      const ro = new ResizeObserver(() => setHeroHeight(heroEl.offsetHeight));
      ro.observe(heroEl);
      return () => ro.disconnect();
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollRange = mounted ? [80, Math.max(heroHeight - 120, 200)] : [80, 500];
  const rawProgress = useTransform(scrollY, scrollRange, [0, 1], { clamp: true });
  const scrollProgress = useSpring(rawProgress, { stiffness: 200, damping: 35, mass: 0.5 });

  const navWidth = useTransform(scrollProgress, [0, 1], ["100%", "92%"]);
  const navMaxWidth = useTransform(scrollProgress, [0, 1], ["1280px", "680px"]);
  const navTop = useTransform(scrollProgress, [0, 1], ["0rem", "1rem"]);
  const navPaddingX = useTransform(scrollProgress, [0, 1], ["1.5rem", "1.25rem"]);
  const bgOpacity = useTransform(scrollProgress, [0, 0.15, 1], [0, 0.8, 1]);
  const bgRadius = useTransform(scrollProgress, [0, 1], ["0px", "9999px"]);
  const linkGap = useTransform(scrollProgress, [0, 1], ["2.5rem", "1.5rem"]);

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) =>
    user?.id && initials ? (
      <div className="flex items-center hover:scale-105 transition-transform cursor-pointer">
        <LandingProfileDropdown logoUrl={logoUrl} initials={initials} />
      </div>
    ) : (
      <div className={`flex ${mobile ? "flex-col w-full gap-3" : "items-center gap-3 sm:gap-4"}`}>
        <Link
          href="/login"
          onClick={() => setMobileOpen(false)}
          className={`text-sm font-medium text-white/50 hover:text-white transition-colors ${mobile ? "text-center py-3 glass rounded-2xl" : ""}`}
        >
          Sign in
        </Link>
        <Link
          href="/register"
          onClick={() => setMobileOpen(false)}
          className={`btn-gold font-bold whitespace-nowrap ${mobile ? "text-center py-3.5 rounded-2xl w-full" : "px-5 py-2 rounded-full text-sm"}`}
        >
          Try free
        </Link>
      </div>
    );

  if (!mounted) {
    return (
      <nav className="fixed top-0 inset-x-0 mx-auto z-50 flex items-center justify-center w-full max-w-[1280px] h-[4rem] sm:h-[4.5rem] px-4 sm:px-6">
        <div className="flex items-center w-full justify-between">
          <div className="flex justify-start items-center shrink-0">
            <AnimatedLogo size="md" showText={false} />
          </div>
          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="flex justify-end items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex">
              <AuthButtons />
            </div>
            <button
              className="md:hidden w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <motion.nav
        className="fixed inset-x-0 mx-auto z-50 flex items-center justify-center h-[4rem] sm:h-[4.5rem]"
        style={{ width: navWidth, maxWidth: navMaxWidth, top: navTop, paddingLeft: navPaddingX, paddingRight: navPaddingX }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none glass-nav"
          style={{ opacity: bgOpacity, borderRadius: bgRadius }}
        />

        <div className="flex items-center w-full justify-between relative z-10">
          <div className="flex justify-start items-center shrink-0">
            <AnimatedLogo size="md" showText={false} />
          </div>

          <motion.div className="hidden md:flex items-center shrink-0" style={{ gap: linkGap }}>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-link text-sm font-medium text-white/50 hover:text-gold transition-colors whitespace-nowrap">{l.label}</a>
            ))}
          </motion.div>

          <div className="flex justify-end items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden sm:flex">
              <AuthButtons />
            </div>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 w-[min(320px,85vw)] z-[70] glass-nav border-l border-white/10 p-6 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <AnimatedLogo size="sm" showText={true} />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1">
                {NAV_LINKS.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-3.5 rounded-2xl text-base font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>

              <div className="pt-6 border-t border-white/10">
                {user?.id && initials ? (
                  /* Logged-in: profile card with avatar + org name */
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 glass rounded-2xl p-4 border border-white/10 hover:border-gold/30 hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/20 flex items-center justify-center text-gold text-sm font-black shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {orgName || "My account"}
                      </p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Go to dashboard →</p>
                    </div>
                  </Link>
                ) : (
                  /* Logged-out: Sign in + Try free */
                  <div className="flex flex-col w-full gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-white/50 hover:text-white transition-colors text-center py-3 glass rounded-2xl"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="btn-gold font-bold text-center py-3.5 rounded-2xl w-full"
                    >
                      Try free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
