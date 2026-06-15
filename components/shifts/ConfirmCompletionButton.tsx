"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { approveShiftCompletion } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";

interface Props {
  shiftId: string;
  workerName?: string;
  shiftTitle?: string;
}

export function ConfirmCompletionButton({ shiftId, workerName, shiftTitle }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await approveShiftCompletion(shiftId);
      toast({
        title: "Shift confirmed as complete",
        description: `"${shiftTitle ?? "Shift"}" has been marked as Done.`,
        className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
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
        flex items-center justify-center gap-2
        h-9 px-4 rounded-xl
        bg-emerald-500/10 border border-emerald-500/20
        text-emerald-400 text-[10px] font-black uppercase tracking-widest
        hover:bg-emerald-500/20 hover:border-emerald-500/40
        active:scale-95 transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap
      "
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <CheckCircle2 className="w-3 h-3" />
      )}
      {loading ? "Confirming…" : "Confirm Done"}
    </button>
  );
}
