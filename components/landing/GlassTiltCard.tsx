import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassTiltCardProps {
  children: ReactNode;
  className?: string;
  /** Kept for API compatibility; the 3D tilt effect has been retired. */
  intensity?: number;
}

export function GlassTiltCard({ children, className }: GlassTiltCardProps) {
  return <div className={cn("relative group", className)}>{children}</div>;
}
