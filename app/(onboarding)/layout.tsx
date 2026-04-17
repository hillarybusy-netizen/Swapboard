import { RefreshCw } from "lucide-react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col">
      {/* Background Mesh */}
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />
      
      <header className="flex items-center justify-between p-8 md:px-12 relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/10 shadow-lg shadow-gold/5">
            <RefreshCw className="w-5 h-5 text-gold" />
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">
            Swap<span className="text-gold">Board</span>
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 relative z-10">
        {children}
      </main>
    </div>
  );
}
