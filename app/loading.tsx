import Loader from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center z-50 gap-8">
      <Loader />
      <p className="text-white/30 text-xs font-black uppercase tracking-widest animate-pulse">
        Loading SwapBoard...
      </p>
    </div>
  );
}
