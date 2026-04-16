import Link from "next/link";
import { ArrowRight, RefreshCw, Clock, TrendingUp, Shield, Users, BarChart3, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#d4af37]" />
            <span className="font-bold text-lg tracking-tight">
              Swap<span className="text-[#d4af37]">Board</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-[#d4af37] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#d4af37] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#d4af37] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="btn-gold px-4 py-2 rounded-lg text-sm"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            14-day free trial · No credit card required
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
            Shift swapping,{" "}
            <span className="text-gold-gradient">finally solved</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            SwapBoard eliminates the chaos of last-minute shift changes. Workers swap shifts instantly, managers approve in one tap — no more group chats, no more no-shows.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-gold flex items-center gap-2 px-8 py-4 rounded-xl text-base w-full sm:w-auto justify-center"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl text-base border border-white/10 hover:border-[#d4af37]/40 transition-colors w-full sm:w-auto text-center text-white/70 hover:text-white"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "94%", label: "Swap fulfillment rate" },
            { value: "2 min", label: "Avg. swap resolution" },
            { value: "$4,200", label: "Avg. monthly savings" },
            { value: "3 hrs", label: "Manager time saved/week" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black text-[#d4af37] mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Built for <span className="text-gold-gradient">real operations</span>
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Whether you run a restaurant, hospital, or retail chain — SwapBoard adapts to your industry.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: RefreshCw,
                title: "Instant swap requests",
                desc: "Workers post swap requests in seconds. Eligible colleagues get notified immediately.",
              },
              {
                icon: Clock,
                title: "One-tap approvals",
                desc: "Managers approve or reject swaps from their phone. No back-and-forth calls needed.",
              },
              {
                icon: BarChart3,
                title: "ROI analytics",
                desc: "See exactly how much you've saved in overtime costs and manager time every week.",
              },
              {
                icon: Users,
                title: "Multi-department",
                desc: "Restaurant, healthcare, retail — set up departments and roles that match your structure.",
              },
              {
                icon: Shield,
                title: "Compliance ready",
                desc: "Full audit trail of every swap. Stay compliant with labour regulations effortlessly.",
              },
              {
                icon: TrendingUp,
                title: "Trial tracking",
                desc: "14-day trial with built-in feedback collection so you can prove ROI to leadership.",
              },
            ].map((f) => (
              <div key={f.title} className="card-matte p-6 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-[#d4af37]" />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-16">
            Up and running in <span className="text-gold-gradient">3 steps</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Set up your org", desc: "Choose your industry, add departments, and invite your team in minutes." },
              { step: "02", title: "Workers request swaps", desc: "Staff post swap requests from their phone. Qualified colleagues can accept instantly." },
              { step: "03", title: "Managers approve", desc: "One tap to approve. The schedule updates automatically for everyone." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-5xl font-black text-[#d4af37]/20 mb-4">{s.step}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Simple pricing</h2>
            <p className="text-white/40">Start free. Scale as you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
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
                className={`rounded-xl p-6 ${
                  plan.highlighted
                    ? "bg-[#d4af37]/10 border border-[#d4af37]/40"
                    : "card-matte"
                }`}
              >
                {plan.highlighted && (
                  <div className="text-xs font-semibold text-[#d4af37] mb-3 uppercase tracking-wider">Most popular</div>
                )}
                <h3 className="font-black text-xl mb-1">{plan.name}</h3>
                <div className="text-4xl font-black text-[#d4af37] mb-1">
                  {plan.price}<span className="text-base font-normal text-white/40">/mo</span>
                </div>
                <p className="text-sm text-white/40 mb-6">{plan.desc}</p>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 text-[#d4af37] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-lg text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "btn-gold"
                      : "border border-white/10 hover:border-[#d4af37]/40 text-white/70 hover:text-white"
                  }`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            Ready to fix your <span className="text-gold-gradient">shift chaos?</span>
          </h2>
          <p className="text-white/40 mb-8">
            Join hundreds of managers who&apos;ve reclaimed their time with SwapBoard.
          </p>
          <Link
            href="/register"
            className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base"
          >
            Start your 14-day free trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#d4af37]" />
            <span className="font-bold text-sm">Swap<span className="text-[#d4af37]">Board</span></span>
          </div>
          <p className="text-xs text-white/20">© 2026 SwapBoard. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
