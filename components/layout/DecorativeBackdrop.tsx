/**
 * Decorative blurred backdrop — gold-themed abstract shapes for auth & onboarding.
 * Sits behind all content; pointer-events none so it never blocks interaction.
 */
export function DecorativeBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
      <div className="absolute inset-0 bg-mesh opacity-[0.22]" />

      {/* Soft ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-[420px] bg-gold/[0.12] blur-[64px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[480px] h-[480px] bg-gold/[0.09] blur-[80px] rounded-full translate-x-1/4 translate-y-1/4" />

      {/* Layer 1 — geometric art */}
      <div className="absolute inset-0 blur-[18px] opacity-[0.75]">
        <svg
          className="absolute top-[6%] left-[4%] w-48 h-48 text-gold/65"
          viewBox="0 0 120 120"
          fill="none"
        >
          <circle cx="60" cy="60" r="52" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="60" r="28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" />
          <line x1="60" y1="8" x2="60" y2="112" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="60" x2="112" y2="60" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <svg
          className="absolute top-[28%] right-[6%] w-56 h-56 text-gold/55"
          viewBox="0 0 140 140"
          fill="none"
        >
          <polygon
            points="70,12 128,118 12,118"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="70,32 108,108 32,108"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="5 7"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          className="absolute bottom-[18%] left-[10%] w-64 h-40 text-gold/50"
          viewBox="0 0 200 120"
          fill="none"
        >
          <path
            d="M10 90 C50 20, 150 20, 190 90"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M30 95 C65 45, 135 45, 170 95"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>

        <div className="absolute top-[55%] left-[42%] w-32 h-32 rounded-full border-2 border-gold/40" />
        <div className="absolute bottom-[8%] right-[22%] w-24 h-24 rotate-45 border-2 border-gold/35 rounded-lg" />
      </div>

      {/* Layer 2 — scatter lines & dots */}
      <div className="absolute inset-0 blur-[8px] opacity-[0.55]">
        <svg className="absolute inset-0 w-full h-full text-gold/45" preserveAspectRatio="none">
          <line x1="0%" y1="22%" x2="100%" y2="38%" stroke="currentColor" strokeWidth="1" />
          <line x1="0%" y1="68%" x2="100%" y2="52%" stroke="currentColor" strokeWidth="1" />
          <line x1="18%" y1="0%" x2="42%" y2="100%" stroke="currentColor" strokeWidth="0.75" strokeDasharray="8 12" />
          <line x1="78%" y1="0%" x2="58%" y2="100%" stroke="currentColor" strokeWidth="0.75" strokeDasharray="8 12" />
        </svg>

        {[
          { top: "12%", left: "72%", size: 7 },
          { top: "38%", left: "18%", size: 5 },
          { top: "62%", left: "80%", size: 6 },
          { top: "78%", left: "28%", size: 4 },
          { top: "20%", left: "48%", size: 5 },
          { top: "85%", left: "62%", size: 6 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gold/60"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
            }}
          />
        ))}
      </div>

      {/* Layer 3 — figure silhouettes */}
      <div className="absolute inset-0 blur-[12px] opacity-[0.5]">
        <svg
          className="absolute bottom-[12%] right-[8%] w-44 h-44 text-gold/55"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle cx="50" cy="22" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M50 34 L50 62 M50 44 L30 58 M50 44 L70 58 M50 62 L35 88 M50 62 L65 88"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <svg
          className="absolute top-[14%] right-[28%] w-36 h-36 text-gold/45"
          viewBox="0 0 80 80"
          fill="none"
        >
          <rect x="10" y="20" width="60" height="45" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M10 32 H70" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="40" cy="48" r="8" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        <svg
          className="absolute top-[48%] left-[6%] w-40 h-40 text-gold/40"
          viewBox="0 0 90 90"
          fill="none"
        >
          <path
            d="M15 75 L45 15 L75 75 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M28 58 H62" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Light vignette — keeps center readable without hiding the art */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_85%)] opacity-45" />
    </div>
  );
}
