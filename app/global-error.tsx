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
     
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <main className="min-h-dvh relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
          </div>

          <section className="max-w-2xl mx-auto px-6 py-20 md:py-28 text-center">
            <p className="text-xs uppercase tracking-wider text-red-300/80 font-semibold">Something Went Wrong</p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mt-3">Unexpected crash</h1>
            <p className="text-white/70 mt-4 leading-relaxed">
              We hit an unexpected issue while opening this page. Redirecting to landing in{" "}
              <span className="text-gold font-semibold">3 seconds</span>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={reset}
                className="btn-gold rounded-full px-7 h-11 inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="rounded-full px-7 h-11 inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
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
