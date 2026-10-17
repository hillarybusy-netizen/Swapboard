"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GlassTiltCard } from "@/components/landing/GlassTiltCard";

const INDUSTRIES = [
  {
    src: "/landing/restaurant-team.jpg",
    alt: "Restaurant operations",
    label: "Restaurants",
    stat: "2,400+ locations",
  },
  {
    src: "/landing/healthcare-team.jpg",
    alt: "Healthcare staffing",
    label: "Healthcare",
    stat: "98% compliance",
  },
  {
    src: "/landing/retail-floor.jpg",
    alt: "Retail shift coordination",
    label: "Retail",
    stat: "12K+ daily swaps",
  },
];

export function LandingIndustryStrip() {
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[#080808] border-b border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.28em] text-gold/60 mb-8 sm:mb-10">
          Built for every industry
        </p>

        <div className="relative overflow-hidden w-full -mx-4 px-4 sm:mx-0 sm:px-0">
          <motion.div
            className="flex gap-4 md:gap-6 w-max"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity,
            }}
          >
            {/* 12 items total -> 50% is 6 items -> perfectly loops back. */}
            {[...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES].map((photo, i) => (
              <IndustryCard
                key={`${photo.src}-${i}`}
                photo={photo}
                className="w-[280px] sm:w-[330px] md:w-[380px] shrink-0"
              />
            ))}
          </motion.div>
          {/* Fading edges to make the loop look seamless */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </section>
  );
}

function IndustryCard({
  photo,
  className = "",
}: {
  photo: (typeof INDUSTRIES)[number];
  className?: string;
}) {
  return (
    <GlassTiltCard intensity={8} className={className}>
      <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 group cursor-default shadow-2xl">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="450px"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top Tag: Industry Operation Type */}
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase tracking-wider text-white/90 shadow-md">
            {photo.alt}
          </span>
        </div>

        {/* Top Right Live Indicator */}
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse z-10" />

        {/* Bottom Details */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10">
          <motion.p
            className="text-lg sm:text-xl font-black uppercase tracking-wider text-white mb-1 drop-shadow-sm"
            initial={false}
          >
            {photo.label}
          </motion.p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-gold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              {photo.stat}
            </p>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
              Verified Network
            </span>
          </div>
        </div>
      </div>
    </GlassTiltCard>
  );
}
