import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { landingMetadata } from "@/lib/metadata";
import { LandingStructuredData } from "@/components/seo/StructuredData";
import { LandingFaq } from "@/components/seo/LandingFaq";

export const metadata: Metadata = landingMetadata;
import { ArrowRight, RefreshCw, Clock, Shield, Users, BarChart3, MapPin, CalendarDays } from "lucide-react";
import { IconBrandTiktok, IconBrandLinkedin } from "@tabler/icons-react";
import { DEMO_HREF, DEMO_SECTION_HREF, GENERAL_EMAIL, ONBOARD_EMAIL, COMPANY_LOCATION, SOCIAL_LINKS } from "@/lib/contact";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { LandingSmoothScroll } from "@/components/layout/LandingSmoothScroll";
import { LandingCoverageVisual, LandingVerificationVisual, LandingAnalyticsVisual } from "@/components/landing/LandingShowcaseCards";

import { FadeUpOnScroll, StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingLiveDemoSection } from "@/components/landing/LandingLiveDemoSection";
import { LandingAnimatedStats } from "@/components/landing/LandingAnimatedStats";
import { LandingIndustryStrip } from "@/components/landing/LandingIndustryStrip";
import { LandingTestimonialCarousel } from "@/components/landing/LandingTestimonialCarousel";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";



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
      <LandingLiveDemoSection />
      <LandingAnimatedStats />
      <LandingIndustryStrip />

      {/* Features — Bento Grid */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 bg-[#080808] relative overflow-hidden">

        <div className="max-w-7xl mx-auto">
          <FadeUpOnScroll>
            <div className="text-center mb-14 sm:mb-20 relative">
              <p className="text-sm font-medium text-gold mb-3">Platform capabilities</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-5 tracking-tight">
                Built for <span className="text-gold-gradient">real operations</span>
              </h2>
              <p className="text-white/55 max-w-lg mx-auto text-base sm:text-lg font-medium px-4">
                Whether you run a restaurant, hospital, or retail chain — SwapBoard adapts to your exact complexity.
              </p>
            </div>
          </FadeUpOnScroll>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {/* Card 1 — Large hero card */}
            <StaggerItem className="lg:col-span-2">
              <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 h-full min-h-[280px] flex flex-col justify-between hover:border-white/[0.14] transition-colors duration-300">
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gold/[0.08] border border-gold/20 flex items-center justify-center mb-6">
                    <RefreshCw className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-xs font-medium text-gold/80 mb-2">Operations</p>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-3 tracking-tight">Instant swap requests</h3>
                  <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-md font-medium">Workers post swap requests in seconds. Eligible colleagues are notified immediately. No group chats, no confusion — just clean, traceable requests.</p>
                </div>
                <div className="relative z-10 mt-6 flex items-center gap-2 text-gold/70 text-sm font-medium group-hover:text-gold transition-colors">
                  <span>Reduce swap time by 85%</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </StaggerItem>

            {/* Card 2 */}
            <StaggerItem>
              <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 h-full min-h-[280px] flex flex-col justify-between hover:border-white/[0.14] transition-colors duration-300">
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gold/[0.08] border border-gold/20 flex items-center justify-center mb-6">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-xs font-medium text-gold/80 mb-2">Management</p>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">One-tap approvals</h3>
                  <p className="text-white/55 text-sm leading-relaxed font-medium">Managers approve or reject swaps from their lock screen. No back-and-forth calls, no emails, no wasted time.</p>
                </div>
              </div>
            </StaggerItem>

            {/* Card 3 */}
            <StaggerItem>
              <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 h-full min-h-[260px] flex flex-col justify-between hover:border-white/[0.14] transition-colors duration-300">
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gold/[0.08] border border-gold/20 flex items-center justify-center mb-6">
                    <BarChart3 className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-xs font-medium text-gold/80 mb-2">Insights</p>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">ROI analytics</h3>
                  <p className="text-white/55 text-sm leading-relaxed font-medium">See exactly how much you've saved in overtime costs and manager hours — tracked automatically every week.</p>
                </div>
              </div>
            </StaggerItem>

            {/* Card 4 — Large hero card with two sub-features */}
            <StaggerItem className="lg:col-span-2">
              <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 h-full min-h-[260px] flex flex-col justify-between hover:border-white/[0.14] transition-colors duration-300">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-8">
                  <div className="flex-1">
                    <div className="w-11 h-11 rounded-xl bg-gold/[0.08] border border-gold/20 flex items-center justify-center mb-6">
                      <Shield className="w-5 h-5 text-gold" />
                    </div>
                    <p className="text-xs font-medium text-gold/80 mb-2">Security</p>
                    <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Compliance ready</h3>
                    <p className="text-white/55 text-sm leading-relaxed font-medium">Full audit trail for every swap. Certifications, role validation, and shift overlap detection — all automated. Stay compliant without lifting a finger.</p>
                  </div>
                  <div className="flex-1 sm:border-l sm:border-white/5 sm:pl-8">
                    <div className="w-11 h-11 rounded-xl bg-gold/[0.08] border border-gold/20 flex items-center justify-center mb-6">
                      <Users className="w-5 h-5 text-gold" />
                    </div>
                    <p className="text-xs font-medium text-gold/80 mb-2">Structure</p>
                    <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">Multi-department</h3>
                    <p className="text-white/55 text-sm leading-relaxed font-medium">Set up departments, roles, and certifications that match your exact org structure — from restaurant to hospital ward.</p>
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
              <p className="text-sm font-medium text-gold mb-3">Why SwapBoard</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
                The new standard for <br />
                <span className="text-gold-gradient">schedule operations</span>
              </h2>
            </div>
            <div className="max-w-sm">
              <p className="text-base text-white/55 leading-relaxed">
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
                    <div className="card-premium p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col min-h-[360px] sm:h-[400px] justify-between relative overflow-hidden group">
                      <Visual />
                      <div>
                        <h3 className="font-semibold text-lg sm:text-xl text-white mb-2">{title}</h3>
                        <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
                      </div>
                    </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeUpOnScroll>
      </section>

      <LandingHowItWorks />

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative bg-gradient-to-b from-[#0f0d09] to-[#080808] border-t border-white/5">
        <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
        <FadeUpOnScroll className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-24">
            <p className="text-sm font-medium text-gold mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold mb-4 sm:mb-6 tracking-tight">Simple, honest pricing</h2>
            <p className="text-white/50 text-base sm:text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <LandingPricing />
        </FadeUpOnScroll>
      </section>

      {/* Book a demo */}
      <section id="demo" className="scroll-mt-24 py-20 sm:py-28 px-4 sm:px-6 bg-[#080808] border-t border-white/5">
        <FadeUpOnScroll className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-medium text-gold mb-3">Book a demo</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5">
                See SwapBoard with your own shifts in mind
              </h2>
              <p className="text-base sm:text-lg text-white/60 leading-relaxed mb-4">
                Book a free 15-minute demo with the founder. We&apos;ll walk through how a call-in works on SwapBoard — post the shift, eligible staff get notified, someone claims it, you approve — using healthcare shifts like the ones your team actually covers.
              </p>
              <p className="text-base text-white/45">
                No slides, no pressure, and no obligation to start a pilot.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                {["Post the shift", "Staff notified", "Someone claims", "You approve"].map((step, i) => (
                  <li key={step} className="rounded-xl border border-white/[0.07] bg-black/30 px-3 py-3">
                    <span className="block text-xs font-medium text-gold tabular-nums mb-1">0{i + 1}</span>
                    <span className="block text-sm font-medium text-white/85 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
              <a
                href={DEMO_HREF}
                className="btn-gold flex items-center justify-center gap-2 w-full px-6 py-4 rounded-full text-base"
              >
                <CalendarDays className="w-4 h-4" />
                Book my demo
              </a>
              <p className="mt-2 text-center text-xs text-white/45">{ONBOARD_EMAIL}</p>
              <div className="mt-6 pt-6 border-t border-white/[0.07] text-sm text-white/55 leading-relaxed">
                Prefer to write first? Email{" "}
                <a href={`mailto:${ONBOARD_EMAIL}`} className="font-semibold text-white hover:text-gold transition-colors">
                  {ONBOARD_EMAIL}
                </a>{" "}
                with your facility name and roughly how many staff you schedule — we&apos;ll reply within one business day with times.
              </div>
            </div>
          </div>
        </FadeUpOnScroll>
      </section>

      <LandingFaq />

      {/* CTA */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-[#080808] to-[#141008]">
        <FadeUpOnScroll>
          <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-white/10 p-10 sm:p-16 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute inset-0 overflow-hidden">
              <Image src="/landing/restaurant-team.jpg" alt="" fill className="object-cover opacity-30 scale-105 transition-transform duration-[2s]" sizes="800px" />
              <div className="absolute inset-0 bg-[#060606]/60" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-7xl font-semibold mb-6 sm:mb-8 tracking-tight relative z-10">
              Fix your <br /><span className="text-gold-gradient">shift chaos.</span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-xl mx-auto font-medium relative z-10 px-2">
              Join 500+ managers who reclaimed 10+ hours a week and eliminated missed shifts completely.
            </p>
            <Link
              href="/onboarding/industry"
              className="btn-gold inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full text-base sm:text-lg relative z-10 group"
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
          <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr] mb-12 sm:mb-16">
            <div className="flex flex-col gap-4">
              <AnimatedLogo size="md" showText={true} />
              <p className="text-white/80 max-w-xs text-sm leading-relaxed font-medium">
                Shift swapping for healthcare teams — post, claim, approve, done.
              </p>
              <p className="text-white/45 max-w-xs text-sm leading-relaxed">
                The modern standard for shift management and team coordination. Built for scale, designed for simplicity.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10">
              <div className="flex flex-col gap-3">
                <h4 className="text-white text-sm font-semibold">Product</h4>
                <a href="#features" className="text-white/55 text-sm hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-white/55 text-sm hover:text-white transition-colors">How it works</a>
                <a href="#pricing" className="text-white/55 text-sm hover:text-white transition-colors">Pricing</a>
                <a href="#faq" className="text-white/55 text-sm hover:text-white transition-colors">FAQ</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-white text-sm font-semibold">Company</h4>
                <a href={DEMO_SECTION_HREF} className="text-white/55 text-sm hover:text-white transition-colors">Demo</a>
                <a href={DEMO_SECTION_HREF} className="text-white/55 text-sm hover:text-white transition-colors">About</a>
                <a href={`mailto:${GENERAL_EMAIL}?subject=Careers`} className="text-white/55 text-sm hover:text-white transition-colors">Careers</a>
                <a href={DEMO_SECTION_HREF} className="text-white/55 text-sm hover:text-white transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-white text-sm font-semibold">Legal</h4>
                <a href="/privacy" className="text-white/55 text-sm hover:text-white transition-colors">Privacy</a>
                <a href="/terms" className="text-white/55 text-sm hover:text-white transition-colors">Terms</a>
              </div>
              <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
                <h4 className="text-white text-sm font-semibold">Contact</h4>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">General</p>
                  <a href={`mailto:${GENERAL_EMAIL}`} className="text-sm text-white/70 hover:text-gold transition-colors break-all">{GENERAL_EMAIL}</a>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Book a demo / onboarding</p>
                  <a href={`mailto:${ONBOARD_EMAIL}`} className="text-sm text-white/70 hover:text-gold transition-colors break-all">{ONBOARD_EMAIL}</a>
                </div>
                <p className="flex items-start gap-1.5 text-sm text-white/55">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/40" />
                  <span>SwapBoard — {COMPANY_LOCATION}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-xs text-white/40 text-center sm:text-left">© 2026 SwapBoard Inc. All rights reserved.</p>
            <div className="flex gap-3">
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="SwapBoard on TikTok (@swapboard)" className="w-9 h-9 rounded-full border border-white/10 hover:border-white/25 transition-colors flex items-center justify-center text-white/55 hover:text-white">
                <IconBrandTiktok className="w-4 h-4" stroke={1.75} />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="SwapBoard founder on LinkedIn" className="w-9 h-9 rounded-full border border-white/10 hover:border-white/25 transition-colors flex items-center justify-center text-white/55 hover:text-white">
                <IconBrandLinkedin className="w-4 h-4" stroke={1.75} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
