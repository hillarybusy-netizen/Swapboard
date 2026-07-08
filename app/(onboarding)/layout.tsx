import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { DecorativeBackdrop } from "@/components/layout/DecorativeBackdrop";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#050505] relative flex flex-col">
      <DecorativeBackdrop />

      <header className="flex items-center px-4 py-4 sm:px-6 sm:py-5 md:px-8 relative z-10 shrink-0">
        <AnimatedLogo size="lg" showText={true} />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-6 sm:px-6 sm:pb-8 md:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
