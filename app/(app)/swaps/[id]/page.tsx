import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { formatShiftDate, formatShiftTime, timeAgo, SWAP_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { SwapActionButtons } from "@/components/swaps/SwapActionButtons";

export const dynamic = "force-dynamic";

export default async function SwapDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: swap } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(*, department:departments(*)), requester:profiles!swap_requests_requester_id_fkey(*), covering_worker:profiles!swap_requests_covering_worker_id_fkey(*), approver:profiles!swap_requests_approved_by_fkey(*)")
    .eq("id", params.id)
    .single();

  if (!swap) notFound();

  const { data: profile } = await supabase.from("profiles").select("user_role").eq("id", user.id).single();
  const isManager = profile?.user_role === "manager" || profile?.user_role === "admin";
  const isRequester = (swap as any).requester_id === user.id;
  const isCovering = (swap as any).covering_worker_id === user.id;

  const shift = (swap as any).shift;
  const requester = (swap as any).requester;
  const covering = (swap as any).covering_worker;

  const statusBadge: Record<string, any> = {
    pending: "warning", worker_accepted: "info", manager_approved: "success", rejected: "destructive", cancelled: "secondary",
  };

  const timeline = [
    { label: "Swap requested", time: swap.requested_at },
    swap.worker_responded_at && { label: covering ? `${covering.full_name} accepted` : "Worker responded", time: swap.worker_responded_at },
    swap.manager_responded_at && { label: swap.status === "manager_approved" ? "Manager approved" : "Manager rejected", time: swap.manager_responded_at },
  ].filter(Boolean) as { label: string; time: string }[];

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/swaps" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to swaps
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" /> Swap Request
        </h1>
        <Badge variant={statusBadge[swap.status] ?? "outline"} className="text-sm">
          {SWAP_STATUS_LABELS[swap.status] ?? swap.status}
        </Badge>
      </div>

      {/* Shift details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Shift details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {shift && (
            <>
              <p className="font-medium">{shift.title}</p>
              {shift.department && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: shift.department.color }} />
                  {shift.department.name}
                </div>
              )}
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" /> {formatShiftDate(shift.start_time)}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" /> {formatShiftTime(shift.start_time, shift.end_time)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* People */}
      <Card>
        <CardHeader><CardTitle className="text-base">People</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar><AvatarFallback>{requester?.full_name?.charAt(0) ?? "?"}</AvatarFallback></Avatar>
            <div>
              <p className="font-medium">{requester?.full_name ?? "Unknown"}</p>
              <p className="text-sm text-muted-foreground">Requesting swap{swap.reason && ` — "${swap.reason}"`}</p>
            </div>
          </div>
          {covering && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{covering.full_name?.charAt(0) ?? "?"}</AvatarFallback></Avatar>
                <div>
                  <p className="font-medium">{covering.full_name}</p>
                  <p className="text-sm text-muted-foreground">Covering worker</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeline.map((event, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium">{event.label}</span>
                <span className="text-muted-foreground ml-auto">{timeAgo(event.time)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <SwapActionButtons swap={swap as any} userId={user.id} isManager={isManager} isRequester={isRequester} isCovering={isCovering} />
    </div>
  );
}
