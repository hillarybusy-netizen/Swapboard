import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { DecorativeBackdrop } from "@/components/layout/DecorativeBackdrop";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex flex-col items-center justify-center bg-[#050505] px-4 py-6 sm:px-6 sm:py-10 relative overflow-x-hidden overflow-y-auto">
      <DecorativeBackdrop />

      <div className="w-full max-w-lg relative z-10 flex flex-col items-center gap-5 sm:gap-6">
        <AnimatedLogo size="xl" showText={false} className="shrink-0" />
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
