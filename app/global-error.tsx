"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <main className="min-h-dvh relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-red-500/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gold/10 blur-3xl rounded-full" />
          </div>

          <section className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-red-300/80 font-black">Something Went Wrong</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mt-3">Unexpected crash</h1>
            <p className="text-white/70 mt-4 leading-relaxed">
              We hit an unexpected issue while opening this page. Redirecting to landing in{" "}
              <span className="text-gold font-black">3 seconds</span>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="btn-gold rounded-full px-7 h-11 inline-flex items-center justify-center text-xs font-black uppercase tracking-widest"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="rounded-full px-7 h-11 inline-flex items-center justify-center text-xs font-black uppercase tracking-widest border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
              >
                Go Now
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
