import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh w-screen flex flex-col items-center justify-center bg-[#050505] p-3 sm:p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute inset-0 bg-mesh opacity-30 -z-20" />

      <div className="w-full max-w-md relative z-10 flex flex-col justify-center h-full max-h-full py-2 sm:py-4">
        {/* Logo */}
        <div className="flex items-center justify-center mt-8 sm:mt-12 mb-6 sm:mb-8 shrink-0">
          <AnimatedLogo size="2xl" />
        </div>
        <div className="flex-1 min-h-0 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
