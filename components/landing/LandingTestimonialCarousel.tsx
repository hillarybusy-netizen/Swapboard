"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Award, Shield } from "lucide-react";
import { FadeUpOnScroll } from "@/components/animations/ScrollAnimations";

const TESTIMONIALS = [
  {
    quote:
      "SwapBoard has completely solved our last-minute callout nightmare. Managers saved over 12 hours a week, and floor coverage reached a solid 100% within the first month.",
    name: "Marcus Chen",
    role: "Operations Director",
    company: "Harbor Kitchen Group",
    image: "/landing/testimonial-portrait.jpg",
  },
  {
    quote:
      "Our nurses can swap shifts from their phones without calling the charge nurse. Compliance is automatic, and we've cut overtime spend by 18% in Q1 alone.",
    name: "Dr. Sarah Okonkwo",
    role: "Nursing Manager",
    company: "Northside Medical",
    image: "/landing/healthcare-team.jpg",
  },
  {
    quote:
      "We rolled out across 12 retail locations in a weekend. Staff adoption was instant — the drag-and-drop swap flow just makes sense to everyone on the floor.",
    name: "James Rivera",
    role: "Regional Ops Lead",
    company: "Urban Retail Co.",
    image: "/landing/retail-floor.jpg",
  },
];

export function LandingTestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const current = TESTIMONIALS[index];

  const prev = () => setIndex((i) => (i === 0 ? TESTIMONIALS.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === TESTIMONIALS.length - 1 ? 0 : i + 1));

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-[#1a1610] to-[#100e0a] border-y border-gold/15">
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

      <FadeUpOnScroll className="max-w-4xl mx-auto text-center relative z-10">
        {/* Stars */}
        <div className="flex items-center justify-center gap-1.5 mb-6 sm:mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-gold text-gold text-glow-gold" />
            </motion.div>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative px-4 sm:px-16 md:px-20">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass border border-white/10 hover:border-gold/30 hover:bg-gold/5 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center gap-6 sm:gap-8 min-h-[280px] sm:min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gold/30 shadow-xl shadow-gold/10 ring-4 ring-gold/5">
                  <Image
                    src={current.image}
                    alt={current.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                <blockquote className="text-lg sm:text-xl md:text-3xl font-medium text-white/90 leading-relaxed tracking-tight max-w-2xl mx-auto font-serif italic px-2">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>

                <div className="text-center">
                  <p className="text-sm font-bold text-white">{current.name}</p>
                  <p className="text-xs text-white/40 font-medium mt-0.5">
                    {current.role} · {current.company}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass border border-white/10 hover:border-gold/30 hover:bg-gold/5 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-gold" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Badges */}
        <FadeUpOnScroll delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 mt-10 sm:mt-12 opacity-60">
            <div className="flex items-center gap-3">
              <Award className="w-7 h-7 sm:w-8 sm:h-8 text-gold" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">G2 Crowd 2026</p>
                <p className="text-[11px] font-bold text-white">#1 Easiest to Use Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-gold" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Fast Company</p>
                <p className="text-[11px] font-bold text-white">Most Innovative Tech 2026</p>
              </div>
            </div>
          </div>
        </FadeUpOnScroll>
      </FadeUpOnScroll>
    </section>
  );
}
