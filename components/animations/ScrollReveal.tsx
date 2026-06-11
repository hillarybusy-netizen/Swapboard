"use client";

import { motion } from "framer-motion";

export function ScrollReveal({ 
  children, 
  delay = 0,
  className = "" 
}: { 
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] // Out-expo style easing for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
