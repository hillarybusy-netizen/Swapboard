import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RequestSwapButton } from "@/components/shifts/RequestSwapButton";
import { Calendar, Clock, ArrowLeftRight } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-emerald-50 border-emerald-100",
  open: "bg-amber-50 border-amber-100",
  swap_pending: "bg-blue-50 border-blue-100",
  swapped: "bg-gray-50 border-gray-100",
  cancelled: "bg-red-50 border-red-100",
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
    return (
      <Card className={`${isPast ? "opacity-60" : ""} ${STATUS_COLORS[shift.status] ?? ""}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-semibold">{shift.title}</p>
              {shift.department && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: shift.department.color }} />
                  <span className="text-xs text-muted-foreground">{shift.department.name}</span>
                </div>
              )}
            </div>
            <Badge variant="outline" className="text-xs shrink-0">
              {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {formatShiftDate(shift.start_time)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatShiftTime(shift.start_time, shift.end_time)} · {formatShiftDuration(shift.start_time, shift.end_time)}
            </span>
          </div>
          {canSwap && (
            <RequestSwapButton shiftId={shift.id} shiftTitle={shift.title} />
          )}
          {shift.status === "swap_pending" && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Swap request in progress
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">My Shifts</h1>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Upcoming ({upcomingShifts.length})
        </h2>
        {upcomingShifts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No upcoming shifts
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingShifts.map((s) => <ShiftCard key={s.id} shift={s} isPast={false} />)}
          </div>
        )}
      </section>

      {pastShifts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Past shifts</h2>
          <div className="space-y-3">
            {pastShifts.map((s) => <ShiftCard key={s.id} shift={s} isPast={true} />)}
          </div>
        </section>
      )}
    </div>
  );
}
