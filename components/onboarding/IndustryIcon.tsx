import { cn } from "@/lib/utils";

export type IndustryIconKey = "restaurant" | "healthcare" | "retail";

const svgProps = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IndustryIcon({
  type,
  className,
}: {
  type: IndustryIconKey;
  className?: string;
}) {
  return (
    <svg {...svgProps} className={cn("w-10 h-10 md:w-11 md:h-11", className)} aria-hidden>
      {type === "restaurant" && (
        <>
          {/* Fork & knife */}
          <path d="M16 8v14c0 2.2-1.8 4-4 4" />
          <path d="M16 8v20" />
          <path d="M13 8v6" />
          <path d="M32 8v32" />
          <path d="M32 8c3 0 5 2.2 5 5v7c0 2.8-2.2 5-5 5" />
        </>
      )}
      {type === "healthcare" && (
        <>
          {/* Stethoscope */}
          <path d="M12 10v8a8 8 0 0 0 16 0V10" />
          <path d="M20 26v4a6 6 0 0 0 12 0v-2" />
          <circle cx="34" cy="28" r="3" />
          <path d="M20 10h8" />
        </>
      )}
      {type === "retail" && (
        <>
          {/* Shopping bag */}
          <path d="M12 18h24l-2 22H14L12 18z" />
          <path d="M18 18v-4a6 6 0 0 1 12 0v4" />
          <path d="M20 26h8" />
        </>
      )}
    </svg>
  );
}
