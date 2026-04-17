import Link from "next/link";
import { ArrowRight, RefreshCw, Clock, TrendingUp, Shield, Users, BarChart3, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30">
      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 glass rounded-full px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-gold" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Swap<span className="text-gold">Board</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
          <a href="#features" className="hover:text-gold transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gold transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-gold transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-sm font-medium text-white/50 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="btn-gold px-5 py-2 rounded-full text-sm font-bold"
          >
            Try free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/5 blur-[120px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto text-center relative">

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] text-glow-gold">
            Shift swapping,<br />
            <span className="text-gold-gradient">finally solved.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Eliminate the chaos of last-minute shift changes. SwapBoard empowers your team to trade shifts instantly, giving managers time back and ensuring 100% floor coverage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/register"
              className="btn-gold flex items-center gap-2 px-10 py-4 rounded-full text-base w-full sm:w-auto justify-center group"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="px-10 py-4 rounded-full text-base font-medium glass hover:bg-white/10 transition-all w-full sm:w-auto text-center"
            >
              View demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-6 relative border-y border-white/5 bg-mesh">
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
      <section id="features" className="py-32 px-6">
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

      {/* How it works */}
      <section id="how-it-works" className="py-32 px-6 relative overflow-hidden">
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
      <section id="pricing" className="py-32 px-6 bg-mesh">
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
                features: ["Up to 50 workers", "3 departments", "Basic analytics", "Email support"],
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
      <section className="py-32 px-6">
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
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-gold" />
                </div>
                <span className="font-bold text-2xl tracking-tighter">Swap<span className="text-gold">Board</span></span>
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
                <a href="#" className="text-white/40 text-sm hover:text-gold transition-colors">About</a>
                <a href="#" className="text-white/40 text-sm hover:text-gold transition-colors">Careers</a>
                <a href="#" className="text-white/40 text-sm hover:text-gold transition-colors">Contact</a>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase">Legal</h4>
                <a href="#" className="text-white/40 text-sm hover:text-gold transition-colors">Privacy</a>
                <a href="#" className="text-white/40 text-sm hover:text-gold transition-colors">Terms</a>
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
