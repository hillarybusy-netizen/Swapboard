import { RefreshCw } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-2 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gold/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute inset-0 bg-mesh opacity-30 -z-20" />

      <div className="w-full max-w-md relative z-10 py-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shadow-xl shadow-gold/5 border border-gold/10">
            <RefreshCw className="w-5 h-5 text-gold" />
          </div>
          <span className="text-3xl font-bold tracking-tighter text-white">
            Swap<span className="text-gold">Board</span>
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
