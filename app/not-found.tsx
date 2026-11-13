import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="min-h-dvh bg-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
      </div>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-gold/70 font-semibold">Oops, sorry</p>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mt-2">404</h1>
          <p className="text-2xl md:text-4xl font-semibold text-white/90 mt-2">Page Not Found</p>
        </div>

        <div className="glass border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-2xl">
          <div className="flex items-center justify-center gap-6 md:gap-8 mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 border-gold/40 bg-gold/10 flex items-center justify-center">
              <span className="text-4xl md:text-5xl">🔌</span>
            </div>
            <div className="w-20 md:w-24 h-1 border-t-4 border-dashed border-white/25" />
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl border-2 border-white/15 bg-white/[0.03] flex items-center justify-center">
              <span className="text-4xl md:text-5xl opacity-50">🕳️</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-white/70 leading-relaxed">
            Looks like this page got unplugged. The URL does not exist, or the page has moved.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="btn-gold rounded-full px-7 h-11 inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider"
          >
            Back To Landing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full px-7 h-11 inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
          >
            Go To Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
