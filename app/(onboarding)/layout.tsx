import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />
      
      <header className="flex items-center justify-between p-8 md:px-12 relative z-50">
        <AnimatedLogo size="md" showText={true} />
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
