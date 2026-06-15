"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import { markShiftPendingCompletion } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";

interface Props {
  shiftId: string;
  shiftTitle: string;
}

export function MarkAsDoneButton({ shiftId, shiftTitle }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await markShiftPendingCompletion(shiftId);
      toast({
        title: "Awaiting confirmation",
        description: `"${shiftTitle}" has been marked as done. Your manager will confirm it shortly.`,
        className: "bg-blue-500/20 border-blue-500/50 text-blue-300",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
        bg-emerald-500/10 border border-emerald-500/20 
        text-emerald-400 text-[10px] font-black uppercase tracking-widest
        hover:bg-emerald-500/20 hover:border-emerald-500/40
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3.5 h-3.5" />
      )}
      {loading ? "Submitting…" : "Mark as Done"}
    </button>
  );
}
