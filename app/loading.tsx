import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
        <div className="absolute inset-0 blur-xl bg-[#d4af37]/20 rounded-full animate-pulse" />
      </div>
      <p className="mt-4 text-[#d4af37]/60 text-sm font-medium tracking-widest uppercase animate-pulse">
        Loading SwapBoard
      </p>
    </div>
  );
}
