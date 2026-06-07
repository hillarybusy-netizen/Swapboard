import Link from "next/link";
import { ArrowRight, RefreshCw, Clock, TrendingUp, Shield, Users, BarChart3, CheckCircle, Gift, Star, ChevronLeft, ChevronRight, Globe, Send, Sparkles, Check, Award } from "lucide-react";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

import { createClient } from "@/lib/supabase/server";
import { LandingProfileDropdown } from "@/components/layout/LandingProfileDropdown";
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
    user = data.user;

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, organization:organizations(*)")
        .eq("id", user.id)
        .single();
      
      org = (profile as any)?.organization;
      if (org?.name) {
        initials = org.name.substring(0, 2).toUpperCase();
      } else if (profile?.full_name) {
        initials = profile.full_name.substring(0, 2).toUpperCase();
      }
    }
  }

  const logoUrl = org?.settings?.logo_url;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30">
      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 glass-nav rounded-full px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AnimatedLogo size="sm" showText={true} />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          <a href="#features" className="hover:text-gold transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gold transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-gold transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center hover:scale-105 transition-transform cursor-pointer">
              <LandingProfileDropdown logoUrl={logoUrl} initials={initials} />
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-white/50 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-gold px-5 py-2 rounded-full text-sm font-bold"
              >
                Try free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden bg-gradient-to-b from-[#14120d] via-[#090807] to-[#060606]">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 leading-[1.15] md:leading-[1.1] text-center max-w-3xl mx-auto">
            <span className="text-white">Create </span>
            <span className="text-white/40 font-light">a system </span>
            <span className="text-white">of stable </span>
            <span className="inline-flex items-center justify-center bg-gold/10 border border-gold/30 rounded-xl p-1.5 mx-1 md:mx-2 align-middle">
              <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-gold animate-spin-slow" />
            </span>
            <span className="text-white">coverage </span>
            <span className="text-white/40 font-light">where staff </span>
            <span className="text-white">trade shifts </span>
            <span className="text-white">for </span>
            <span className="text-gold-gradient block sm:inline">your business 24/7</span>
          </h1>

          <p className="text-sm md:text-base text-white/50 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
            Get started in under 3 minutes. Eliminate last-minute callouts and let your team trade shifts instantly without any coordination chaos.
          </p>

          <div className="flex flex-col items-center justify-center gap-4">
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
                  className="flex items-center gap-2 text-xs md:text-sm font-bold text-gold/80 hover:text-gold transition-colors mt-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Try for free — 14-day premium trial included</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 relative border-y border-gold/10 bg-gradient-to-r from-[#16130d] via-[#0c0b08] to-[#16130d] bg-mesh">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: "94%", label: "Swap fulfillment rate" },
            { value: "2 min", label: "Avg. swap resolution" },
            { value: "$4,200", label: "Avg. monthly savings" },
            { value: "3 hrs", label: "Manager time saved/week" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="text-4xl md:text-5xl font-black text-gold mb-2 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[12px] font-bold uppercase tracking-widest text-white/30">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Built for <span className="text-gold-gradient">real operations</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              Whether you run a restaurant, hospital, or retail chain — SwapBoard adapts to your industry complexity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: RefreshCw,
                title: "Instant swap requests",
                desc: "Workers post swap requests in seconds. Eligible colleagues get notified immediately via push.",
              },
              {
                icon: Clock,
                title: "One-tap approvals",
                desc: "Managers approve or reject swaps from their lock screen. No back-and-forth calls needed.",
              },
              {
                icon: BarChart3,
                title: "ROI analytics",
                desc: "See exactly how much you've saved in overtime costs and manager time every single week.",
              },
              {
                icon: Users,
                title: "Multi-department",
                desc: "Restaurant, healthcare, retail — set up departments and roles that match your exact structure.",
              },
              {
                icon: Shield,
                title: "Compliance ready",
                desc: "Full audit trail of every swap. Stay compliant with labour regulations effortlessly.",
              },
              {
                icon: TrendingUp,
                title: "Trial tracking",
                desc: "14-day trial with built-in feedback collection so you can prove ROI to leadership fast.",
              },
            ].map((f) => (
              <div key={f.title} className="card-premium p-8 rounded-[2rem] flex flex-col group">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <f.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-bold text-xl mb-3">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Testimonial Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-[#15120a] to-[#0c0b08] border-y border-gold/15 bg-mesh">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Star Rating */}
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-gold text-gold text-glow-gold" />
            ))}
          </div>

          {/* Quote Carousel-like Layout */}
          <div className="relative px-12 md:px-20">
            {/* Navigation Arrows */}
            <button className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/10 hover:border-gold/30 hover:bg-gold/5 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <blockquote className="text-xl md:text-3xl font-medium text-white/90 leading-relaxed tracking-tight max-w-2xl mx-auto font-serif italic">
              "SwapBoard has completely solved our last-minute callout nightmare. Managers saved over 12 hours a week, and floor coverage reached a solid 100% within the first month."
            </blockquote>

            <button className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/10 hover:border-gold/30 hover:bg-gold/5 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Laurels & Badges */}
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
        </div>
      </section>

      {/* The New Standard Grid Section */}
      <section className="py-32 px-6 bg-[#0b0a08] relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
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
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Abstract Global Coverage */}
            <div className="card-premium p-8 rounded-[2.5rem] flex flex-col h-[400px] justify-between relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />
              
              {/* Graphic container */}
              <div className="h-44 w-full rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden flex items-center justify-center relative shadow-inner">
                {/* Simulated Globe graphic */}
                <div className="w-32 h-32 rounded-full border border-white/10 relative flex items-center justify-center bg-gradient-to-tr from-transparent via-white/5 to-transparent shadow-2xl animate-spin-slow">
                  <div className="absolute inset-2 rounded-full border border-dashed border-white/20" />
                  <div className="absolute inset-6 rounded-full border border-white/10" />
                  <Globe className="w-10 h-10 text-gold opacity-50" />
                </div>
                <div className="absolute bottom-4 flex gap-1 bg-[#050505]/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">94% Active Swap Rates</span>
                </div>
              </div>

              <div>
                <h3 className="font-black text-xl text-white mb-2">Freedom to trade</h3>
                <p className="text-xs text-white/40 leading-relaxed font-semibold">
                  Give staff the absolute power to trade and cover shifts on-demand while preserving complete system integrity.
                </p>
              </div>
            </div>

            {/* Card 2: Interactive UI Controls */}
            <div className="card-premium p-8 rounded-[2.5rem] flex flex-col h-[400px] justify-between relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />

              {/* Graphic container - Interactive buttons mock */}
              <div className="h-44 w-full rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-2 justify-center shadow-inner relative">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#050505]/30 backdrop-blur-sm border border-white/10 p-3 rounded-xl flex items-center gap-2 hover:border-gold/30 hover:bg-gold/5 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <Send className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Send Request</span>
                  </div>
                  <div className="bg-[#050505]/30 backdrop-blur-sm border border-white/10 p-3 rounded-xl flex items-center gap-2 hover:border-gold/30 hover:bg-gold/5 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Swap Shift</span>
                  </div>
                  <div className="bg-[#050505]/30 backdrop-blur-sm border border-white/10 p-3 rounded-xl flex items-center gap-2 hover:border-gold/30 hover:bg-gold/5 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Verify Cert</span>
                  </div>
                  <div className="bg-[#050505]/30 backdrop-blur-sm border border-white/10 p-3 rounded-xl flex items-center gap-2 hover:border-gold/30 hover:bg-gold/5 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3 h-3 text-gold" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">AI Coverage</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-xl text-white mb-2">Automated verification</h3>
                <p className="text-xs text-white/40 leading-relaxed font-semibold">
                  Self-service scheduling with automated logic verifying roles, certifications, and shift overlaps instantly.
                </p>
              </div>
            </div>

            {/* Card 3: 3D-Like Glass Bar Chart */}
            <div className="card-premium p-8 rounded-[2.5rem] flex flex-col h-[400px] justify-between relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-gold/5 rounded-full blur-[60px] group-hover:bg-gold/10 transition-all duration-700" />

              {/* Graphic container - 3D Glass bars */}
              <div className="h-44 w-full rounded-2xl bg-white/[0.02] border border-white/5 p-6 flex items-end justify-center gap-4 shadow-inner relative overflow-hidden">
                <div className="w-8 bg-gradient-to-t from-gold/5 to-gold/30 border border-gold/20 rounded-t-lg h-16 relative group-hover:h-24 transition-all duration-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-gold absolute -top-5">40%</span>
                </div>
                <div className="w-8 bg-gradient-to-t from-gold/10 to-gold/50 border border-gold/30 rounded-t-lg h-24 relative group-hover:h-32 transition-all duration-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-gold absolute -top-5">70%</span>
                </div>
                <div className="w-8 bg-gradient-to-t from-gold/20 to-gold/80 border border-gold/50 rounded-t-lg h-32 relative group-hover:h-40 transition-all duration-500 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-gold absolute -top-5">94%</span>
                </div>
                
                <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest text-white/30">Fulfillment Ascend</div>
              </div>

              <div>
                <h3 className="font-black text-xl text-white mb-2">Unparalleled performance</h3>
                <p className="text-xs text-white/40 leading-relaxed font-semibold">
                  Gain instant insight into schedule health, cost-benefit savings, and manager time recovery on a unified dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden bg-[#070707]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gold/[0.02] blur-[150px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-24 tracking-tight">
            Up and running in <br /><span className="text-gold-gradient">3 simple steps</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-16 relative">
            {/* Connection Line (Hidden on mobile) */}
            <div className="hidden md:block absolute top-[60px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent -z-10" />

            {[
              { step: "01", title: "Set up your org", desc: "Choose your industry, add departments, and invite your team in minutes." },
              { step: "02", title: "Workers request swaps", desc: "Staff post swap requests from their phone. Qualified colleagues can accept instantly." },
              { step: "03", title: "Managers approve", desc: "One tap to approve. The schedule updates automatically for everyone in real-time." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full glass flex items-center justify-center text-xl font-black text-gold mb-8 shadow-xl shadow-gold/5">
                  {s.step}
                </div>
                <h3 className="font-bold text-2xl mb-4 tracking-tight">{s.title}</h3>
                <p className="text-base text-white/50 leading-relaxed font-medium">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-gradient-to-b from-[#13110d] to-[#060606] border-t border-white/5 bg-mesh">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Simple, honest pricing</h2>
            <p className="text-white/50 text-lg">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$79",
                desc: "Perfect for single-location businesses",
                features: ["Up to 100 workers", "3 departments", "Basic analytics", "Email support"],
                highlighted: false,
              },
              {
                name: "Growth",
                price: "$199",
                desc: "For growing multi-department teams",
                features: ["Up to 200 workers", "Unlimited departments", "ROI analytics", "Priority support", "Custom roles"],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "$499",
                desc: "For large organisations",
                features: ["Unlimited workers", "Multi-location", "Advanced analytics", "Dedicated support", "SSO & compliance"],
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
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
                <h3 className="font-bold text-2xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black text-gold">{plan.price}</span>
                  <span className="text-white/30 font-medium">/mo</span>
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 bg-gradient-to-b from-[#060606] to-[#110e0a]">
        <div className="max-w-4xl mx-auto rounded-[3rem] glass p-16 md:p-24 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full group-hover:bg-gold/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />

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
