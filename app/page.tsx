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
import { FeatureCardVisual } from "@/components/landing/FeatureCardVisual";
import { FadeUpOnScroll, StaggerContainer, StaggerItem, ParallaxOnScroll } from "@/components/animations/ScrollAnimations";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingHeroSection } from "@/components/landing/LandingHeroSection";
import { LandingAnimatedStats } from "@/components/landing/LandingAnimatedStats";
import { LandingIndustryStrip } from "@/components/landing/LandingIndustryStrip";
import { LandingTestimonialCarousel } from "@/components/landing/LandingTestimonialCarousel";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { GlassTiltCard } from "@/components/landing/GlassTiltCard";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

import { createClient } from "@/lib/supabase/server";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { cookies } from "next/headers";

const FeatureContent = ({ desc }: { desc: string }) => {
  return (
    <div className="glass glass-shine border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-5 pointer-events-none" />
      <p className="text-white/80 text-lg md:text-2xl font-sans max-w-3xl mx-auto leading-relaxed relative z-10 text-center font-medium">
        {desc}
      </p>
    </div>
  );
};

const CAROUSEL_FEATURES = [
  {
    category: "Operations",
    title: "Instant swap requests",
    icon: RefreshCw,
    content: <FeatureContent desc="Workers post swap requests in seconds. Eligible colleagues get notified immediately via push." />,
  },
  {
    category: "Management",
    title: "One-tap approvals",
    icon: Clock,
    content: <FeatureContent desc="Managers approve or reject swaps from their lock screen. No back-and-forth calls needed." />,
  },
  {
    category: "Insights",
    title: "ROI analytics",
    icon: BarChart3,
    content: <FeatureContent desc="See exactly how much you've saved in overtime costs and manager time every single week." />,
  },
  {
    category: "Structure",
    title: "Multi-department",
    icon: Users,
    content: <FeatureContent desc="Restaurant, healthcare, retail — set up departments and roles that match your exact structure." />,
  },
  {
    category: "Security",
    title: "Compliance ready",
    icon: Shield,
    content: <FeatureContent desc="Full audit trail of every swap. Stay compliant with labour regulations effortlessly." />,
  },
  {
    category: "Growth",
    title: "Trial tracking",
    icon: TrendingUp,
    content: <FeatureContent desc="14-day trial with built-in feedback collection so you can prove ROI to leadership fast." />,
  },
];

export default async function LandingPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.getAll().some(c => c.name.includes("-auth-token"));

  let user = null;
  let org = null;
  let initials = "";

  if (hasSession) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const authUser = data.user;

    if (authUser) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, organization:organizations(*)")
        .eq("id", authUser.id)
        .single();

      if (profileError || !profile) {
        user = null;
        org = null;
      } else {
        user = authUser;
        org = (profile as any)?.organization;
        // Prefer full name initials, fall back to org name — never use "U"
        if (profile?.full_name) {
          const parts = profile.full_name.trim().split(/\s+/);
          initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0].substring(0, 2).toUpperCase();
        } else if (org?.name) {
          initials = org.name.substring(0, 2).toUpperCase();
        } else {
          initials = "";
        }
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

      {/* Features */}
      <section id="features" className="py-20 sm:py-32 bg-[#080808] relative section-glow-top">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/[0.03] blur-[150px] pointer-events-none" />
        <FadeUpOnScroll>
          <div className="text-center mb-12 sm:mb-16 relative">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gold/50 mb-4">Platform capabilities</p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 tracking-tight px-2">
              Built for <span className="text-gold-gradient">real operations</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg px-4">
              Whether you run a restaurant, hospital, or retail chain — SwapBoard adapts to your industry complexity.
            </p>
          </div>
        </FadeUpOnScroll>
        
        <div className="w-full">
          <Carousel items={CAROUSEL_FEATURES.map((card, index) => (
            <Card key={card.title} card={card} index={index} layout={true} />
          ))} />
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
