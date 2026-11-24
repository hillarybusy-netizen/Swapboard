import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { DEMO_HREF } from "@/lib/contact";
import { LandingWorkerDashboardMock } from "@/components/landing/LandingWorkerDashboardMock";

export const metadata: Metadata = createMetadata({
  title: "Live Demo",
  description:
    "Try the SwapBoard worker app in your browser. Post a shift, browse open shifts and check the swap board — no account needed.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-white/5">
        <Link href="/" className="text-sm font-semibold text-white hover:text-gold transition-colors">
          SwapBoard
        </Link>
        <a
          href={DEMO_HREF}
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-black hover:bg-gold-light transition-colors"
        >
          Book a demo
        </a>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col">
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-sm font-medium text-gold mb-2">Live demo</p>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight mb-3">
            Try the SwapBoard worker app
          </h1>
          <p className="text-sm sm:text-base text-white/55 max-w-xl mx-auto">
            This is what your staff see. Click through the tabs to post a shift, browse open shifts and check the swap board. No account needed.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] bg-[#050505] w-full h-[620px] sm:h-[680px] lg:h-[720px]">
          <LandingWorkerDashboardMock />
        </div>

        <p className="mt-6 text-center text-sm text-white/55">
          Want to see it with your own shifts?{" "}
          <a href={DEMO_HREF} className="font-semibold text-gold hover:text-gold-light transition-colors">
            Book a free 15-minute demo
          </a>
        </p>
      </main>
    </div>
  );
}
