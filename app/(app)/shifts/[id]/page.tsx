import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { RequestSwapButton } from "@/components/shifts/RequestSwapButton";

export const dynamic = "force-dynamic";

export default async function ShiftDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: shift } = await supabase
    .from("shifts")
    .select("*, department:departments(*), role:roles(*), profile:profiles!shifts_assigned_to_fkey(*), creator:profiles!shifts_created_by_fkey(*)")
    .eq("id", params.id)
    .single();

  if (!shift) notFound();

  const { data: profile } = await supabase.from("profiles").select("organization_id, user_role").eq("id", user.id).single();
  const isManager = profile?.user_role === "manager" || profile?.user_role === "admin";
  const isOwner = shift.assigned_to === user.id;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/shifts" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to shifts
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-xl">{shift.title}</CardTitle>
              {shift.department && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: (shift.department as any).color }} />
                  <span className="text-sm text-muted-foreground">{(shift.department as any).name}</span>
                </div>
              )}
            </div>
            <Badge>{SHIFT_STATUS_LABELS[shift.status] ?? shift.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatShiftDate(shift.start_time)}</p>
                <p className="text-muted-foreground">Date</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatShiftTime(shift.start_time, shift.end_time)}</p>
                <p className="text-muted-foreground">{formatShiftDuration(shift.start_time, shift.end_time)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{(shift.profile as any)?.full_name?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{(shift.profile as any)?.full_name ?? "Unassigned"}</p>
              <p className="text-sm text-muted-foreground">Assigned worker</p>
            </div>
          </div>

          {shift.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{shift.notes}</p>
              </div>
            </>
          )}

          {(isOwner || isManager) && shift.status === "scheduled" && (
            <>
              <Separator />
              <div className="flex gap-3">
                {isOwner && <RequestSwapButton shiftId={shift.id} shiftTitle={shift.title} />}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
