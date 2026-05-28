"use client";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { video: "w-7 h-7", text: "text-base" },
  md: { video: "w-10 h-10", text: "text-xl" },
  lg: { video: "w-14 h-14", text: "text-2xl" },
};

export function AnimatedLogo({ size = "md", showText = true, className = "" }: AnimatedLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${s.video} rounded-xl overflow-hidden border border-gold/20 shadow-lg shadow-gold/10 shrink-0 transition-transform group-hover:scale-110 duration-500`}
        style={{ background: "#050505" }}
      >
        <video
          src="/logo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
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
