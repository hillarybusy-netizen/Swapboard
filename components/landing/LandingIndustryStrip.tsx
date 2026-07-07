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

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          <StaggerContainer className="flex gap-4 w-max pb-2">
            {INDUSTRIES.map((photo) => (
              <StaggerItem key={photo.src}>
                <IndustryCard photo={photo} className="w-[260px] snap-center" />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Desktop: grid */}
        <StaggerContainer className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-6">
          {INDUSTRIES.map((photo) => (
            <StaggerItem key={photo.src}>
              <IndustryCard photo={photo} />
            </StaggerItem>
          ))}
        </StaggerContainer>
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
