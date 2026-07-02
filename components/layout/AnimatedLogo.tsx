import { cn } from "@/lib/utils";
import Image from "next/image";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { iconContainer: "w-7 h-7", text: "text-base" },
  md: { iconContainer: "w-10 h-10", text: "text-xl" },
  lg: { iconContainer: "w-14 h-14", text: "text-3xl" },
  xl: { iconContainer: "w-full aspect-square", text: "text-4xl" },
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
      {showText && (
        <span className={`${s.text} font-bold tracking-tighter text-white`}>
          Swap<span className="text-gold">Board</span>
        </span>
      )}
    </div>
  );
}
