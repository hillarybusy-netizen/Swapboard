"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassTiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function GlassTiltCard({
  children,
  className,
  intensity = 12,
}: GlassTiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateX.set(((y - centerY) / centerY) * -intensity);
    rotateY.set(((x - centerX) / centerX) * intensity);
  };

  const handleLeave = () => {
    setHovering(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative group", className)}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-500",
          hovering ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: "radial-gradient(400px circle at 50% 0%, rgba(212,175,55,0.1), transparent 50%)",
        }}
      />
      <div className="relative rounded-[inherit]" style={{ transform: "translateZ(0)" }}>
        {children}
      </div>
    </motion.div>
  );
}
