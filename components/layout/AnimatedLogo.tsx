import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { iconContainer: "w-7 h-7", icon: "w-4 h-4", text: "text-base" },
  md: { iconContainer: "w-10 h-10", icon: "w-5 h-5", text: "text-xl" },
  lg: { iconContainer: "w-14 h-14", icon: "w-7 h-7", text: "text-3xl" },
  xl: { iconContainer: "w-full aspect-square", icon: "w-1/2 h-1/2", text: "text-4xl" },
};

export function AnimatedLogo({ size = "md", showText = true, className = "" }: AnimatedLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div
        className={cn(
          s.iconContainer,
          "flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500",
          size !== "xl" && "rounded-xl border border-gold/20 shadow-lg shadow-gold/10",
          "bg-[#050505] bg-gradient-to-br from-gold/10 to-transparent"
        )}
      >
        <ArrowLeftRight className={cn(s.icon, "text-gold drop-shadow-md")} />
      </div>
      {showText && (
        <span className={`${s.text} font-bold tracking-tighter text-white`}>
          Swap<span className="text-gold">Board</span>
        </span>
      )}
    </div>
  );
}
