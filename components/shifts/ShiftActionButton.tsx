"use client";
import { catchError } from "@/lib/errors";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Play, Clock } from "lucide-react";
import { startShift, markShiftDone, enforceShiftSubmissionDeadline } from "@/lib/actions/shifts";
import { toast } from "@/hooks/use-toast";

interface Props {
  shiftId: string;
  shiftTitle: string;
  status: string;
  startTime: string;
  endTime: string;
}

export function ShiftActionButton({ shiftId, shiftTitle, status, startTime, endTime }: Props) {
  const [loading, setLoading] = useState(false);
  const [canMarkDone, setCanMarkDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "started" || status === "not_started") {
      let deadlineHandled = false;
      const checkDoneTime = () => {
        const endTimeMs = new Date(endTime).getTime();
        const doneTime = endTimeMs + 60000;
        if (status === "started") setCanMarkDone(Date.now() > doneTime);

        const cutoff = status === "not_started" ? endTimeMs : endTimeMs + 15 * 60 * 1000;
        if (!deadlineHandled && Date.now() > cutoff) {
          deadlineHandled = true;
          enforceShiftSubmissionDeadline(shiftId).then((result) => {
            if (result.updated) router.refresh();
          });
        }
      };

      checkDoneTime();
      const interval = setInterval(checkDoneTime, 10000); // Check every 10s
      return () => clearInterval(interval);
    }
  }, [status, endTime, shiftId, router]);

  async function handleStartShift() {
    if (new Date() < new Date(startTime)) {
      toast({
        title: "Too early",
        description: "Shift can't start before its time.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await startShift(shiftId);
      toast({
        title: result.lateStarted ? "Shift Started Late" : "Shift Started",
        description: result.lateStarted
          ? `"${shiftTitle}" was started after the five-minute grace period.`
          : `You have successfully clocked in/started "${shiftTitle}".`,
        className: "bg-blue-500/20 border-blue-500/50 text-blue-300",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkDone() {
    setLoading(true);
    try {
      const result = await markShiftDone(shiftId);
      toast({
        title: result.lateSubmitted ? "Submitted Late" : "Awaiting manager approval",
        description: result.lateSubmitted
          ? `"${shiftTitle}" was submitted after the five-minute grace period.`
          : `"${shiftTitle}" marked as done. Your manager will confirm shortly.`,
        className: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: catchError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (status === "not_started") {
    return (
      <button
        onClick={handleStartShift}
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
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        {loading ? "Starting…" : "Start Shift"}
      </button>
    );
  }

  if (status === "started") {
    if (!canMarkDone) {
      return (
        <button
          disabled
          className="
            w-full flex items-center justify-center gap-2
            h-11 px-6 rounded-2xl
            bg-blue-500/5 border border-blue-500/10
            text-blue-400/50 text-[10px] font-black uppercase tracking-widest
            cursor-not-allowed
          "
        >
          <Clock className="w-3.5 h-3.5" />
          Ongoing
        </button>
      );
    }

    return (
      <button
        onClick={handleMarkDone}
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
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        {loading ? "Submitting…" : "Mark as Done?"}
      </button>
    );
  }

  return null;
}
