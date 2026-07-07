"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GlassTiltCard } from "@/components/landing/GlassTiltCard";
import { StaggerContainer, StaggerItem } from "@/components/animations/ScrollAnimations";

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
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#0a0a0e] border-b border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.25em] text-white/25 mb-6 sm:mb-8">
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
              duration: 40,
              repeat: Infinity,
            }}
          >
            {/* Duplicate the array to ensure enough width for seamless 50% scroll.
                12 items total -> 50% is 6 items -> perfectly loops back. */}
            {[...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES, ...INDUSTRIES].map((photo, i) => (
              <IndustryCard
                key={`${photo.src}-${i}`}
                photo={photo}
                className="w-[260px] sm:w-[300px] md:w-[360px] shrink-0"
              />
            ))}
          </motion.div>
          {/* Fading edges to make the endless loop look cleaner */}
          <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#0a0a0e] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#0a0a0e] to-transparent pointer-events-none" />
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
      <div className="relative h-40 sm:h-48 md:h-52 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 group cursor-default">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="400px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <motion.p
            className="text-sm sm:text-base font-black uppercase tracking-widest text-white mb-1"
            initial={false}
          >
            {photo.label}
          </motion.p>
          <p className="text-[10px] font-bold text-gold/70 uppercase tracking-wider">{photo.stat}</p>
        </div>

        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
      </div>
    </GlassTiltCard>
  );
}
