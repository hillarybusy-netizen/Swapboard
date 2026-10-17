import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { landingMetadata } from "@/lib/metadata";
import { LandingStructuredData } from "@/components/seo/StructuredData";
import { LandingFaq } from "@/components/seo/LandingFaq";

export const metadata: Metadata = landingMetadata;
import { ArrowRight, RefreshCw, Clock, TrendingUp, Shield, Users, BarChart3, Twitter, Linkedin, Github } from "lucide-react";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { LandingSmoothScroll } from "@/components/layout/LandingSmoothScroll";
import { LandingCoverageVisual, LandingVerificationVisual, LandingAnalyticsVisual } from "@/components/landing/LandingShowcaseCards";

import { FadeUpOnScroll, StaggerContainer, StaggerItem, ParallaxOnScroll } from "@/components/animations/ScrollAnimations";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingAnimatedStats } from "@/components/landing/LandingAnimatedStats";
import { LandingIndustryStrip } from "@/components/landing/LandingIndustryStrip";
import { LandingTestimonialCarousel } from "@/components/landing/LandingTestimonialCarousel";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { GlassTiltCard } from "@/components/landing/GlassTiltCard";



import { createClient } from "@/lib/supabase/server";
import { LandingNavbar } from "@/components/layout/LandingNavbar";



export default async function LandingPage() {
  // The middleware refreshes the Supabase token on every request, so
  // getUser() here always reflects the true auth state — no cookie sniffing needed.
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let user = null;
  let org = null;
  let initials = "";

  if (authUser) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*, organization:organizations(*)")
      .eq("id", authUser.id)
      .single();

    if (!profileError && profile) {
      user = authUser;
      org = (profile as any)?.organization;
      if (profile?.full_name) {
        const parts = profile.full_name.trim().split(/\s+/);
        initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase();
      } else if (org?.name) {
        initials = org.name.substring(0, 2).toUpperCase();
      }
    }
  }


  const logoUrl = org?.settings?.logo_url;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30 overflow-x-hidden">
      <LandingStructuredData />
      <LandingSmoothScroll />
      <LandingNavbar user={user} logoUrl={logoUrl} initials={user ? initials : ""} orgName={org?.name ?? null} />

      <LandingHeroSection user={user} orgName={org?.name} />
      <LandingAnimatedStats />
      <LandingIndustryStrip />

      {/* Features — Bento Grid */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 bg-[#080808] relative section-glow-top overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gold/[0.04] blur-[180px] pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <FadeUpOnScroll>
            <div className="text-center mb-14 sm:mb-20 relative">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold/50 mb-4">Platform capabilities</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight">
                Built for <span className="text-gold-gradient">real operations</span>
              </h2>
              <p className="text-white/40 max-w-lg mx-auto text-base sm:text-lg font-medium px-4">
                Whether you run a restaurant, hospital, or retail chain — SwapBoard adapts to your exact complexity.
              </p>
            </div>
          </FadeUpOnScroll>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1 — Large hero card */}
            <StaggerItem className="lg:col-span-2">
              <div className="group relative rounded-[2rem] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-10 h-full min-h-[280px] flex flex-col justify-between hover:border-gold/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(212,175,55,0.06)]">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-gold/[0.06] rounded-full blur-[80px] group-hover:bg-gold/[0.1] transition-colors duration-700" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6 group-hover:bg-gold/20 group-hover:scale-105 transition-all duration-300">
                    <RefreshCw className="w-6 h-6 text-gold" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50 mb-2">Operations</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">Instant swap requests</h3>
                  <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-md font-medium">Workers post swap requests in seconds. Eligible colleagues are notified immediately. No group chats, no confusion — just clean, traceable requests.</p>
                </div>
                <div className="relative z-10 mt-6 flex items-center gap-2 text-gold/50 text-xs font-bold uppercase tracking-widest group-hover:text-gold transition-colors">
                  <span>Reduce swap time by 85%</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </StaggerItem>

            {/* Card 2 */}
            <StaggerItem>
              <div className="group relative rounded-[2rem] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-8 h-full min-h-[280px] flex flex-col justify-between hover:border-blue-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(59,130,246,0.05)]">
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/[0.08] rounded-full blur-[60px] group-hover:bg-blue-500/[0.15] transition-colors duration-700" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all duration-300">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400/50 mb-2">Management</p>
                  <h3 className="text-xl font-black text-white mb-3 tracking-tight">One-tap approvals</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">Managers approve or reject swaps from their lock screen. No back-and-forth calls, no emails, no wasted time.</p>
                </div>
              </div>
            </StaggerItem>

            {/* Card 3 */}
            <StaggerItem>
              <div className="group relative rounded-[2rem] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-8 h-full min-h-[260px] flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(16,185,129,0.05)]">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/[0.08] rounded-full blur-[60px] group-hover:bg-emerald-500/[0.15] transition-colors duration-700" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-300">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400/50 mb-2">Insights</p>
                  <h3 className="text-xl font-black text-white mb-3 tracking-tight">ROI analytics</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">See exactly how much you've saved in overtime costs and manager hours — tracked automatically every week.</p>
                </div>
              </div>
            </StaggerItem>

            {/* Card 4 — Large hero card with two sub-features */}
            <StaggerItem className="lg:col-span-2">
              <div className="group relative rounded-[2rem] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-10 h-full min-h-[260px] flex flex-col justify-between hover:border-purple-500/20 transition-all duration-500 hover:shadow-[0_0_60px_rgba(168,85,247,0.05)]">
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/[0.06] rounded-full blur-[100px] group-hover:bg-purple-500/[0.12] transition-colors duration-700" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-8">
                  <div className="flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all duration-300">
                      <Shield className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400/50 mb-2">Security</p>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Compliance ready</h3>
                    <p className="text-white/40 text-sm leading-relaxed font-medium">Full audit trail for every swap. Certifications, role validation, and shift overlap detection — all automated. Stay compliant without lifting a finger.</p>
                  </div>
                  <div className="flex-1 sm:border-l sm:border-white/5 sm:pl-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-gold/10 group-hover:border-gold/20 group-hover:scale-105 transition-all duration-300">
                      <Users className="w-6 h-6 text-white/50 group-hover:text-gold transition-colors" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-2">Structure</p>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Multi-department</h3>
                    <p className="text-white/40 text-sm leading-relaxed font-medium">Set up departments, roles, and certifications that match your exact org structure — from restaurant to hospital ward.</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <LandingTestimonialCarousel />

      {/* The New Standard Grid Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-[#080808] relative overflow-hidden">
        <FadeUpOnScroll className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-12 sm:mb-20">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50 mb-4">Why SwapBoard</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
                The new standard for <br />
                <span className="text-gold-gradient">schedule operations</span>
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-sm text-white/40 leading-relaxed font-semibold">
                Our automated routing engines ensure complete compliance, certified coverage, and immediate notifications without managers lifting a finger.
              </p>
            </div>
          </div>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[
              { Visual: LandingCoverageVisual, title: "Freedom to trade", desc: "Give staff the absolute power to trade and cover shifts on-demand while preserving complete system integrity." },
              { Visual: LandingVerificationVisual, title: "Automated verification", desc: "Self-service scheduling with automated logic verifying roles, certifications, and shift overlaps instantly." },
              { Visual: LandingAnalyticsVisual, title: "Unparalleled performance", desc: "Gain instant insight into schedule health, cost-benefit savings, and manager time recovery on a unified dashboard." },
            ].map(({ Visual, title, desc }) => (
              <StaggerItem key={title}>
                <ParallaxOnScroll offset={20}>
                  <GlassTiltCard intensity={8}>
                    <div className="card-premium p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col min-h-[360px] sm:h-[400px] justify-between relative overflow-hidden group">
                      <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />
                      <Visual />
                      <div>
                        <h3 className="font-black text-lg sm:text-xl text-white mb-2">{title}</h3>
                        <p className="text-xs text-white/40 leading-relaxed font-semibold">{desc}</p>
                      </div>
                    </div>
                  </GlassTiltCard>
                </ParallaxOnScroll>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeUpOnScroll>
      </section>

      <LandingHowItWorks />

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative bg-gradient-to-b from-[#18140e] to-[#080808] border-t border-white/5 section-glow-top">
        <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
        <FadeUpOnScroll className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-24">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50 mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 tracking-tight">Simple, honest pricing</h2>
            <p className="text-white/50 text-base sm:text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <LandingPricing />
        </FadeUpOnScroll>
      </section>

      <LandingFaq />

      {/* CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-[#080808] to-[#141008]">
        <FadeUpOnScroll>
          <div className="max-w-4xl mx-auto rounded-[2rem] sm:rounded-[3rem] glass glass-shine p-10 sm:p-16 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full group-hover:bg-gold/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
            <div className="absolute inset-0 overflow-hidden">
              <Image src="/landing/restaurant-team.jpg" alt="" fill className="object-cover opacity-30 scale-105 group-hover:scale-110 transition-transform duration-[2s]" sizes="800px" />
              <div className="absolute inset-0 bg-[#060606]/60" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-7xl font-black mb-6 sm:mb-8 tracking-tight relative z-10">
              Fix your <br /><span className="text-gold-gradient">shift chaos.</span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-xl mx-auto font-medium relative z-10 px-2">
              Join 500+ managers who reclaimed 10+ hours a week and eliminated missed shifts completely.
            </p>
            <Link
              href="/onboarding/industry"
              className="btn-gold btn-shine inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg relative z-10 group"
            >
              Start your free trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeUpOnScroll>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 sm:py-16 px-4 sm:px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div className="flex flex-col gap-4 sm:gap-6">
              <AnimatedLogo size="md" showText={true} />
              <p className="text-white/40 max-w-xs text-sm leading-relaxed font-medium">
                The modern standard for shift management and team coordination. Built for scale, designed for simplicity.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 sm:gap-16 w-full md:w-auto">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Product</h4>
                <a href="#features" className="text-white/40 text-sm hover:text-gold transition-colors">Features</a>
                <a href="#how-it-works" className="text-white/40 text-sm hover:text-gold transition-colors">How it works</a>
                <a href="#pricing" className="text-white/40 text-sm hover:text-gold transition-colors">Pricing</a>
                <a href="#faq" className="text-white/40 text-sm hover:text-gold transition-colors">FAQ</a>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Company</h4>
                <a href="mailto:hello@swapboard.app" className="text-white/40 text-sm hover:text-gold transition-colors">About</a>
                <a href="mailto:hello@swapboard.app?subject=Careers" className="text-white/40 text-sm hover:text-gold transition-colors">Careers</a>
                <a href="mailto:hello@swapboard.app" className="text-white/40 text-sm hover:text-gold transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-3 sm:gap-4 col-span-2 sm:col-span-1">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Legal</h4>
                <a href="/privacy" className="text-white/40 text-sm hover:text-gold transition-colors">Privacy</a>
                <a href="/terms" className="text-white/40 text-sm hover:text-gold transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-xs text-white/20 font-medium text-center sm:text-left">© 2026 SwapBoard Inc. All rights reserved.</p>
            <div className="flex gap-6 sm:gap-8">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/20 transition-all cursor-pointer flex items-center justify-center text-white/30 hover:text-gold" title="Twitter">
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/20 transition-all cursor-pointer flex items-center justify-center text-white/30 hover:text-gold" title="LinkedIn">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/20 transition-all cursor-pointer flex items-center justify-center text-white/30 hover:text-gold" title="GitHub">
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
