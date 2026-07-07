import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#050505] relative flex flex-col">
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />

      <header className="flex items-center px-4 py-4 sm:px-6 sm:py-5 md:px-8 relative z-50 shrink-0">
        <AnimatedLogo size="sm" showText={true} />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-6 sm:px-6 sm:pb-8 md:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
