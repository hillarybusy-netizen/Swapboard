import Loader from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 bg-[#050505] z-30">
      <Loader />
      <p className="text-white/45 text-xs font-semibold uppercase tracking-wider animate-pulse">
        Loading...
      </p>
    </div>
  );
}
