import { cn } from "@/lib/utils";
import Image from "next/image";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { iconContainer: "w-8 h-8", text: "text-base" },
  md: { iconContainer: "w-12 h-12", text: "text-xl" },
  lg: { iconContainer: "w-16 h-16", text: "text-3xl" },
  xl: { iconContainer: "w-24 h-24", text: "text-4xl" },
  "2xl": { iconContainer: "w-32 h-32", text: "text-5xl" },
  full: { iconContainer: "w-full aspect-square", text: "text-4xl" },
};

export function AnimatedLogo({ size = "md", showText = true, className = "" }: AnimatedLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          s.iconContainer,
          "relative flex items-center justify-center shrink-0"
        )}
      >
        <Image
          src="/logo.png"
          alt="SwapBoard Logo"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
