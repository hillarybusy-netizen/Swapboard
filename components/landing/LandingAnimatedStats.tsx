"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";

const STATS = [
  { value: 94, suffix: "%", label: "Swap fulfillment rate", decimals: 0 },
  { value: 2, suffix: " min", label: "Avg. swap resolution", decimals: 0, prefix: "" },
  { value: 4200, suffix: "", label: "Avg. monthly savings", prefix: "$", format: true },
  { value: 3, suffix: " hrs", label: "Manager time saved/week", decimals: 0 },
];

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  format = false,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  const formatted = format ? display.toLocaleString() : String(display);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function LandingAnimatedStats() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 relative border-y border-gold/10 bg-gradient-to-r from-[#1c1810] via-[#12100c] to-[#1c1810] overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <StaggerContainer className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center relative">
        {STATS.map((stat) => (
          <StaggerItem key={stat.label}>
            <motion.div
              className="flex flex-col items-center gap-2 p-4 sm:p-0"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gold mb-1">
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  format={stat.format}
                />
              </div>
              <div className="text-[10px] sm:text-[12px] font-bold uppercase tracking-widest text-white/30 leading-snug max-w-[140px]">
                {stat.label}
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
