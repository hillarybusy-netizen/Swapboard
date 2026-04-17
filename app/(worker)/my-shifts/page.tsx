import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RequestSwapButton } from "@/components/shifts/RequestSwapButton";
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "border-gold/20 bg-gold/5",
  open: "border-red-500/20 bg-red-500/5",
  swap_pending: "border-blue-500/20 bg-blue-500/5",
  swapped: "opacity-40",
  cancelled: "border-white/5 bg-white/5 opacity-30",
};

export default async function MyShiftsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date().toISOString();
  const { data: upcomingData } = await supabase
    .from("shifts")
    .select("*, department:departments(*)")
    .eq("assigned_to", user.id)
    .gte("start_time", now)
    .order("start_time", { ascending: true });

  const { data: pastData } = await supabase
    .from("shifts")
    .select("*, department:departments(*)")
    .eq("assigned_to", user.id)
    .lt("start_time", now)
    .order("start_time", { ascending: false })
    .limit(10);

  const upcomingShifts = (upcomingData ?? []) as any[];
  const pastShifts = (pastData ?? []) as any[];

  function ShiftCard({ shift, isPast }: { shift: any; isPast: boolean }) {
    const canSwap = !isPast && shift.status === "scheduled";
    const statusColor = STATUS_COLORS[shift.status] ?? "border-white/5 bg-white/5";
    
    return (
      <div className={cn(
        "glass rounded-[2rem] p-6 border-white/5 transition-all duration-300 relative overflow-hidden group mb-4",
        statusColor,
        isPast && "opacity-40 scale-[0.98]"
      )}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-tight text-white mb-1 truncate">{shift.title}</h3>
            {shift.department && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shift.department.color }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{shift.department.name}</span>
              </div>
            )}
          </div>
          <Badge className={cn(
            "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
            shift.status === "scheduled" ? "bg-gold text-[#050505]" : "bg-white/10 text-white/60"
          )}>
            {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
          </Badge>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm font-bold text-white/60">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <Calendar className="w-4 h-4" />
            </div>
            <span>{formatShiftDate(shift.start_time)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-white/60">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <Clock className="w-4 h-4" />
            </div>
            <span>{formatShiftTime(shift.start_time, shift.end_time)} <span className="text-white/20 ml-1">· {formatShiftDuration(shift.start_time, shift.end_time)}</span></span>
          </div>
        </div>

        {canSwap && (
          <div className="pt-2">
            <RequestSwapButton shiftId={shift.id} shiftTitle={shift.title} />
          </div>
        )}
        
        {shift.status === "swap_pending" && (
          <div className="py-2 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin-slow" />
            Request Processing
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">My Shifts</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Schedule Overview</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gold/60">Upcoming</h2>
          <span className="text-[10px] font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full">{upcomingShifts.length} Shifts</span>
        </div>
        
        {upcomingShifts.length === 0 ? (
          <div className="glass rounded-[2.5rem] p-12 text-center border-white/5">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Free Time</h3>
            <p className="text-xs text-white/30 font-medium">No upcoming shifts scheduled.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {upcomingShifts.map((s) => <ShiftCard key={s.id} shift={s} isPast={false} />)}
          </div>
        )}
      </section>

      {pastShifts.length > 0 && (
        <section className="pt-4 border-t border-white/5">
          <div className="mb-6 px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/20">History</h2>
          </div>
          <div className="grid gap-2">
            {pastShifts.map((s) => <ShiftCard key={s.id} shift={s} isPast={true} />)}
          </div>
        </section>
      )}
    </div>
  );
}
