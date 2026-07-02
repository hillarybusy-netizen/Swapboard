"use client";
import { catchError } from "@/lib/errors";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Loader2 } from "lucide-react";
import { startShift } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";

interface Props {
  shiftId: string;
  shiftTitle: string;
}

export function StartShiftButton({ shiftId, shiftTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    try {
      await startShift(shiftId);
      toast({
        title: "Shift Started",
        description: `You have successfully clocked in/started "${shiftTitle}".`,
        className: "bg-blue-500/20 border-blue-500/50 text-blue-300",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="
        w-full flex items-center justify-center gap-2
        h-11 px-6 rounded-2xl
        bg-blue-500/10 border border-blue-500/20
        text-blue-400 text-[10px] font-black uppercase tracking-widest
        hover:bg-blue-500/20 hover:border-blue-500/40
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:pointer-events-none
      "
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Play className="w-3.5 h-3.5 fill-current" />
      )}
      {loading ? "Starting…" : "Start Shift"}
    </button>
  );
}
