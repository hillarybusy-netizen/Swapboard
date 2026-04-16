import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddShiftDialog } from "@/components/shifts/AddShiftDialog";
import { Calendar, Clock, Users, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "default" | "secondary" | "warning" | "success" | "destructive" | "outline"> = {
  scheduled: "secondary",
  open: "warning",
  swap_pending: "info" as any,
  swapped: "success",
  cancelled: "destructive",
};

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: { dept?: string; status?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("organization_id, user_role").eq("id", user.id).single();
  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const { data: departmentsData } = await supabase.from("departments").select("*").eq("organization_id", orgId).order("sort_order");
  const { data: profilesData } = await supabase.from("profiles").select("id, full_name").eq("organization_id", orgId).eq("is_active", true);

  let query = supabase
    .from("shifts")
    .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(*)")
    .eq("organization_id", orgId)
    .order("start_time", { ascending: true });

  if (searchParams.dept) query = query.eq("department_id", searchParams.dept);
  if (searchParams.status) query = query.eq("status", searchParams.status);

  const { data: rawShifts } = await query;

  const departments = (departmentsData ?? []) as any[];
  const profiles = (profilesData ?? []) as any[];
  const shifts = (rawShifts ?? []) as any[];

  const isManager = profile?.user_role === "manager" || profile?.user_role === "admin";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shifts</h1>
          <p className="text-muted-foreground text-sm">{shifts.length} shift{shifts.length !== 1 ? "s" : ""}</p>
        </div>
        {isManager && (
          <AddShiftDialog departments={departments as any} profiles={profiles as any} orgId={orgId} />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link href="/shifts">
          <Button variant={!searchParams.dept && !searchParams.status ? "default" : "outline"} size="sm">
            All
          </Button>
        </Link>
        {(departments as any[]).map((d) => (
          <Link key={d.id} href={`/shifts?dept=${d.id}`}>
            <Button variant={searchParams.dept === d.id ? "default" : "outline"} size="sm">
              <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: d.color }} />
              {d.name}
            </Button>
          </Link>
        ))}
        <Link href="/shifts?status=open">
          <Button variant={searchParams.status === "open" ? "default" : "outline"} size="sm">Open shifts</Button>
        </Link>
      </div>

      {/* Shifts list */}
      {shifts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium mb-1">No shifts yet</p>
          <p className="text-sm mb-6">Create your first shift to get started.</p>
          {isManager && <AddShiftDialog departments={departments as any} profiles={profiles as any} orgId={orgId} />}
        </div>
      ) : (
        <div className="grid gap-3">
          {(shifts as any[]).map((shift) => (
            <Link key={shift.id} href={`/shifts/${shift.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-3 min-w-0">
                      {shift.department && (
                        <div className="w-1 self-stretch rounded-full shrink-0 mt-1" style={{ backgroundColor: shift.department.color }} />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{shift.title}</p>
                          {shift.department && (
                            <Badge variant="outline" className="text-xs">{shift.department.name}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatShiftDate(shift.start_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatShiftTime(shift.start_time, shift.end_time)} ({formatShiftDuration(shift.start_time, shift.end_time)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {shift.profile ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-xs">
                              {shift.profile.full_name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{shift.profile.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      )}
                      <Badge variant={STATUS_BADGE[shift.status] ?? "outline"}>
                        {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
