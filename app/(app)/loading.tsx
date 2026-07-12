import Loader from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 w-full">
      <Loader />
      <p className="text-white/30 text-xs font-black uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
}
