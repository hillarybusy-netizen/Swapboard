import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { landingMetadata } from "@/lib/metadata";
import { LandingStructuredData } from "@/components/seo/StructuredData";
import { LandingFaq } from "@/components/seo/LandingFaq";

export const metadata: Metadata = landingMetadata;
import { ArrowRight, RefreshCw, Clock, TrendingUp, Shield, Users, BarChart3, CheckCircle, Gift, Star, ChevronLeft, ChevronRight, Award, Infinity } from "lucide-react";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { LandingSmoothScroll } from "@/components/layout/LandingSmoothScroll";
import { LandingHeroPreview } from "@/components/landing/LandingHeroPreview";
import { LandingCoverageVisual, LandingVerificationVisual, LandingAnalyticsVisual } from "@/components/landing/LandingShowcaseCards";
import { FeatureCardVisual } from "@/components/landing/FeatureCardVisual";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { FadeUpOnScroll, ScaleOnScroll, StaggerContainer, StaggerItem, ParallaxOnScroll } from "@/components/animations/ScrollAnimations";

import { createClient } from "@/lib/supabase/server";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { cookies } from "next/headers";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.getAll().some(c => c.name.includes("-auth-token"));

  let user = null;
  let org = null;
  let initials = "U";

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
        if (org?.name) {
          initials = org.name.substring(0, 2).toUpperCase();
        }
      }
    }
  }

  const logoUrl = org?.settings?.logo_url;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30">
      <LandingStructuredData />
      <LandingSmoothScroll />
      {/* Navbar */}
      <LandingNavbar user={user} logoUrl={logoUrl} initials={user ? initials : ""} />

      {/* Hero */}
      <section data-hero-section className="relative pt-44 pb-20 md:pb-32 lg:min-h-screen lg:flex lg:items-center px-6 overflow-hidden">
        {/* Background image */}
        <Image
          src="/landing/workers_together.png"
          alt="Workers together"
          fill
          priority
          className="object-cover opacity-75 scale-105 z-0"
          sizes="100vw"
        />
        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-[#050505]/50 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-[#050505]/60 z-[1]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/10 blur-[120px] rounded-full z-[2]" />

        <div className="relative z-[3] w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16 pt-10">
          {/* Left: text + CTA */}
          <div className="flex-1 text-center lg:text-left lg:pl-12 xl:pl-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-8 leading-[1.1] md:leading-[1.05]">
              <span className="text-white">Create </span>
              <span className="text-white/40 font-light">a system </span>
              <span className="text-white">of stable </span>
              <span className="inline-flex items-center justify-center bg-gold/10 border border-gold/30 rounded-xl p-1.5 mx-1 md:mx-2 align-middle">
                <Infinity className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </span>
              <span className="text-white">coverage </span>
              <span className="text-white/40 font-light">where staff </span>
              <span className="text-white">trade shifts </span>
              <span className="text-white">for </span>
              <span className="text-gold-gradient block sm:inline">your business 24/7</span>
            </h1>

            <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-body font-medium">
              Get started in under 3 minutes. Eliminate last-minute callouts and let your team trade shifts instantly without any coordination chaos.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="btn-gold flex items-center justify-center gap-2 px-12 py-4 rounded-full text-base font-bold w-full sm:w-auto shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Log back into {org?.name || "your"} dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-gold flex items-center justify-center gap-2 px-12 py-4 rounded-full text-base font-bold w-full sm:w-auto shadow-2xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Get started instantly
                  </Link>

                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-gold/80 hover:text-gold transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    <span>14-day free trial included</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: app preview */}
          <div className="flex-1 w-full lg:max-w-[600px]">
            <LandingHeroPreview />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 relative border-y border-gold/10 bg-gradient-to-r from-[#1c1810] via-[#12100c] to-[#1c1810]">
        <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
        <StaggerContainer className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative">
          {[
            { value: "94%", label: "Swap fulfillment rate" },
            { value: "2 min", label: "Avg. swap resolution" },
            { value: "$4,200", label: "Avg. monthly savings" },
            { value: "3 hrs", label: "Manager time saved/week" },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="flex flex-col items-center">
                <div className="text-4xl md:text-5xl font-black text-gold mb-2 tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[12px] font-bold uppercase tracking-widest text-white/30">
                  {stat.label}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Industry strip */}
      <section className="py-16 px-6 bg-[#0a0a0e] border-b border-white/5">
        <StaggerContainer className="max-w-6xl mx-auto grid grid-cols-3 gap-3 md:gap-6">
          {[
            { src: "/landing/restaurant-team.jpg", alt: "Restaurant operations", label: "Restaurants" },
            { src: "/landing/healthcare-team.jpg", alt: "Healthcare staffing", label: "Healthcare" },
            { src: "/landing/retail-floor.jpg", alt: "Retail shift coordination", label: "Retail" },
          ].map((photo) => (
            <StaggerItem key={photo.src}>
              <div className="relative h-36 md:h-52 rounded-2xl overflow-hidden border border-white/10 group">
                <Image src={photo.src} alt={photo.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <p className="absolute bottom-3 left-4 text-sm font-black uppercase tracking-widest text-white">{photo.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-[#080808]">
        <FadeUpOnScroll>
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Built for <span className="text-gold-gradient">real operations</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Whether you run a restaurant, hospital, or retail chain — SwapBoard adapts to your industry complexity.
            </p>
          </div>
        </FadeUpOnScroll>
        <StaggerContainer className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {([
            {
              icon: RefreshCw,
              iconKey: "RefreshCw",
              title: "Instant swap requests",
              desc: "Workers post swap requests in seconds. Eligible colleagues get notified immediately via push.",
            },
            {
              icon: Clock,
              iconKey: "Clock",
              title: "One-tap approvals",
              desc: "Managers approve or reject swaps from their lock screen. No back-and-forth calls needed.",
            },
            {
              icon: BarChart3,
              iconKey: "BarChart3",
              title: "ROI analytics",
              desc: "See exactly how much you've saved in overtime costs and manager time every single week.",
            },
            {
              icon: Users,
              iconKey: "Users",
              title: "Multi-department",
              desc: "Restaurant, healthcare, retail — set up departments and roles that match your exact structure.",
            },
            {
              icon: Shield,
              iconKey: "Shield",
              title: "Compliance ready",
              desc: "Full audit trail of every swap. Stay compliant with labour regulations effortlessly.",
            },
            {
              icon: TrendingUp,
              iconKey: "TrendingUp",
              title: "Trial tracking",
              desc: "14-day trial with built-in feedback collection so you can prove ROI to leadership fast.",
            },
          ] as const).map((f) => (
            <StaggerItem key={f.title}>
              <div className="card-premium p-6 rounded-[2rem] flex flex-col group overflow-hidden">
                <FeatureCardVisual iconName={f.iconKey} />
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                  <f.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Modern Testimonial Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#1a1610] to-[#100e0a] border-y border-gold/15">
        <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
        <FadeUpOnScroll className="max-w-4xl mx-auto text-center relative z-10">
          {/* Star Rating */}
          <StaggerContainer className="flex items-center justify-center gap-1.5 mb-8">
            {[...Array(5)].map((_, i) => (
              <StaggerItem key={i}>
                <Star className="w-5 h-5 fill-gold text-gold text-glow-gold" />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Quote Carousel-like Layout */}
          <div className="relative px-12 md:px-20">
            <button className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/10 hover:border-gold/30 hover:bg-gold/5 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-8">
              <ScaleOnScroll>
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gold/30 shadow-xl shadow-gold/10">
                  <Image
                    src="/landing/testimonial-portrait.jpg"
                    alt="Operations manager"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </ScaleOnScroll>
              <FadeUpOnScroll>
                <blockquote className="text-xl md:text-3xl font-medium text-white/90 leading-relaxed tracking-tight max-w-2xl mx-auto font-serif italic">
                  "SwapBoard has completely solved our last-minute callout nightmare. Managers saved over 12 hours a week, and floor coverage reached a solid 100% within the first month."
                </blockquote>
              </FadeUpOnScroll>
            </div>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/10 hover:border-gold/30 hover:bg-gold/5 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Laurels & Badges */}
          <FadeUpOnScroll delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 mt-12 opacity-60">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-gold" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">G2 Crowd 2026</p>
                  <p className="text-[11px] font-bold text-white">#1 Easiest to Use Tool</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-gold" />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Fast Company</p>
                  <p className="text-[11px] font-bold text-white">Most Innovative Tech 2026</p>
                </div>
              </div>
            </div>
          </FadeUpOnScroll>
        </FadeUpOnScroll>
      </section>

      {/* The New Standard Grid Section */}
      <section className="py-32 px-6 bg-[#080808] relative overflow-hidden">
        <FadeUpOnScroll className="max-w-6xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
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

          {/* Grid Layout (Liquid Glass Cards) */}
          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            <StaggerItem>
              <ParallaxOnScroll offset={30}>
                <div className="card-premium p-8 rounded-[2.5rem] flex flex-col h-[400px] justify-between relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />
                  <LandingCoverageVisual />
                  <div>
                    <h3 className="font-black text-xl text-white mb-2">Freedom to trade</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-semibold">
                      Give staff the absolute power to trade and cover shifts on-demand while preserving complete system integrity.
                    </p>
                  </div>
                </div>
              </ParallaxOnScroll>
            </StaggerItem>

            <StaggerItem>
              <ParallaxOnScroll offset={30}>
                <div className="card-premium p-8 rounded-[2.5rem] flex flex-col h-[400px] justify-between relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />
                  <LandingVerificationVisual />
                  <div>
                    <h3 className="font-black text-xl text-white mb-2">Automated verification</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-semibold">
                      Self-service scheduling with automated logic verifying roles, certifications, and shift overlaps instantly.
                    </p>
                  </div>
                </div>
              </ParallaxOnScroll>
            </StaggerItem>

            <StaggerItem>
              <ParallaxOnScroll offset={30}>
                <div className="card-premium p-8 rounded-[2.5rem] flex flex-col h-[400px] justify-between relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />
                  <LandingAnalyticsVisual />
                  <div>
                    <h3 className="font-black text-xl text-white mb-2">Unparalleled performance</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-semibold">
                      Gain instant insight into schedule health, cost-benefit savings, and manager time recovery on a unified dashboard.
                    </p>
                  </div>
                </div>
              </ParallaxOnScroll>
            </StaggerItem>
          </StaggerContainer>
        </FadeUpOnScroll>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden bg-[#06080c]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gold/[0.04] blur-[150px] -z-10" />

        <FadeUpOnScroll className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-24 tracking-tight">
            Up and running in <br /><span className="text-gold-gradient">3 simple steps</span>
          </h2>
          <div className="relative">
            {/* Connection Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-[60px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent -z-10" />

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
              {([
                { step: "01", title: "Set up your org", desc: "Choose your industry, add departments, and invite your team in minutes.", image: "/landing/office-planning.jpg" },
                { step: "02", title: "Workers request swaps", desc: "Staff post swap requests from their phone. Qualified colleagues can accept instantly.", image: "/landing/mobile-shift.jpg" },
                { step: "03", title: "Managers approve", desc: "One tap to approve. The schedule updates automatically for everyone in real-time.", image: "/landing/manager-team.jpg" },
              ] as const).map((s) => (
                <StaggerItem key={s.step}>
                  <div className="flex flex-col items-center">
                    <div className="relative mb-8">
                      <div className="relative w-40 h-28 md:w-56 md:h-36 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 mb-4">
                        <Image src={s.image} alt={s.title} fill className="object-cover" sizes="224px" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070707]/70 via-transparent to-transparent" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full glass flex items-center justify-center text-sm md:text-lg font-black text-gold shadow-xl shadow-gold/5 border border-gold/20">
                        {s.step}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg md:text-2xl mb-2 md:mb-4 tracking-tight mt-6">{s.title}</h3>
                    <p className="text-xs md:text-base text-white/50 leading-relaxed font-medium">{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeUpOnScroll>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 relative bg-gradient-to-b from-[#18140e] to-[#080808] border-t border-white/5">
        <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
        <FadeUpOnScroll className="max-w-6xl mx-auto relative">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Simple, honest pricing</h2>
            <p className="text-white/50 text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$79",
                annualPrice: "$59",
                desc: "Perfect for single-location businesses",
                features: ["Up to 100 workers", "3 departments", "Basic analytics", "Email support"],
                highlighted: false,
              },
              {
                name: "Growth",
                price: "$199",
                annualPrice: "$149",
                desc: "For growing multi-department teams",
                features: ["Up to 200 workers", "Unlimited departments", "ROI analytics", "Priority support", "Custom roles"],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "$499",
                annualPrice: "$374",
                desc: "For large organisations",
                features: ["Unlimited workers", "Multi-location", "Advanced analytics", "Dedicated support", "SSO & compliance"],
                highlighted: false,
              },
            ].map((plan) => (
              <StaggerItem key={plan.name}>
                <ScaleOnScroll>
                  <div
                    className={`relative rounded-[2.5rem] p-10 flex flex-col ${plan.highlighted
                      ? "glass shadow-2xl shadow-gold/10 border-gold/40 scale-105 z-10"
                      : "card-premium opacity-80"
                      }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gold text-[#050505] text-[10px] font-black uppercase tracking-widest">
                        Most popular
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-2xl">{plan.name}</h3>
                      <div className="bg-gold/10 text-gold text-xs font-bold px-2 py-1 rounded-md border border-gold/20">
                        Save 25%
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white/30 line-through decoration-white/30">{plan.price}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-gold">{plan.annualPrice}</span>
                          <span className="text-white/30 font-medium">/mo</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-white/40 font-medium tracking-wide">Billed annually</span>
                    </div>
                    <p className="text-sm text-white/50 mb-10 font-medium min-h-[40px]">{plan.desc}</p>
                    <div className="h-[2px] w-full bg-white/5 mb-10" />
                    <ul className="space-y-4 mb-12 flex-grow">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-3 text-sm font-medium text-white/60">
                          <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                            <CheckCircle className="w-3 h-3 text-gold" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className={`block text-center py-4 rounded-full text-base font-bold transition-all ${plan.highlighted
                        ? "btn-gold"
                        : "glass hover:bg-white/5 text-white/80"
                        }`}
                    >
                      Start your trial
                    </Link>
                  </div>
                </ScaleOnScroll>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </FadeUpOnScroll>
      </section>

      <LandingFaq />

      {/* CTA */}
      <section className="py-32 px-6 bg-gradient-to-b from-[#080808] to-[#141008]">
        <FadeUpOnScroll>
          <div className="max-w-4xl mx-auto rounded-[3rem] glass p-16 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full group-hover:bg-gold/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
            <div className="absolute inset-0 overflow-hidden">
              <Image src="/landing/restaurant-team.jpg" alt="" fill className="object-cover opacity-30" sizes="800px" />
              <div className="absolute inset-0 bg-[#060606]/60" />
            </div>

            <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tight relative z-10">
              Fix your <br /><span className="text-gold-gradient">shift chaos.</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl mb-12 max-w-xl mx-auto font-medium relative z-10">
              Join 500+ managers who reclaimed 10+ hours a week and eliminated missed shifts completely.
            </p>
            <Link
              href="/register"
              className="btn-gold inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg relative z-10 group"
            >
              Start your free trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeUpOnScroll>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 mb-16">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <AnimatedLogo size="md" showText={true} />
              </div>
              <p className="text-white/40 max-w-xs text-sm leading-relaxed font-medium">
                The modern standard for shift management and team coordination. Built for scale, designed for simplicity.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Product</h4>
                <a href="#features" className="text-white/40 text-sm hover:text-gold transition-colors">Features</a>
                <a href="#how-it-works" className="text-white/40 text-sm hover:text-gold transition-colors">How it works</a>
                <a href="#pricing" className="text-white/40 text-sm hover:text-gold transition-colors">Pricing</a>
                <a href="#faq" className="text-white/40 text-sm hover:text-gold transition-colors">FAQ</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Company</h4>
                <a href="mailto:hello@swapboard.app" className="text-white/40 text-sm hover:text-gold transition-colors">About</a>
                <a href="mailto:hello@swapboard.app?subject=Careers" className="text-white/40 text-sm hover:text-gold transition-colors">Careers</a>
                <a href="mailto:hello@swapboard.app" className="text-white/40 text-sm hover:text-gold transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Legal</h4>
                <a href="/privacy" className="text-white/40 text-sm hover:text-gold transition-colors">Privacy</a>
                <a href="/terms" className="text-white/40 text-sm hover:text-gold transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs text-white/20 font-medium">© 2026 SwapBoard Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <div className="w-5 h-5 rounded-full bg-white/5 hover:bg-gold/10 transition-colors cursor-pointer" />
              <div className="w-5 h-5 rounded-full bg-white/5 hover:bg-gold/10 transition-colors cursor-pointer" />
              <div className="w-5 h-5 rounded-full bg-white/5 hover:bg-gold/10 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
