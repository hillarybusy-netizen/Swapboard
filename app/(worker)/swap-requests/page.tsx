import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, timeAgo } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerSwapActions } from "@/components/swaps/WorkerSwapActions";
import { ArrowLeftRight, Calendar, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SwapRequestsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("organization_id, department_id").eq("id", user.id).single();

  const { data: myRequestsData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(*, department:departments(*)), covering_worker:profiles!swap_requests_covering_worker_id_fkey(*)")
    .eq("requester_id", user.id)
    .order("requested_at", { ascending: false });

  const { data: availableSwapsData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(*, department:departments(*)), requester:profiles!swap_requests_requester_id_fkey(*)")
    .eq("organization_id", profile?.organization_id ?? "")
    .eq("status", "pending")
    .neq("requester_id", user.id)
    .is("covering_worker_id", null)
    .order("requested_at", { ascending: false });

  const myRequests = (myRequestsData ?? []) as any[];
  const availableSwaps = (availableSwapsData ?? []) as any[];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Swap Requests</h1>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Available to cover ({availableSwaps.length})
        </h2>
        {availableSwaps.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No open swap requests right now
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {availableSwaps.map((swap) => (
              <Card key={swap.id} className="border-blue-100 bg-blue-50/40">
                <CardContent className="pt-4 pb-4 space-y-3">
                  <div>
                    <p className="font-medium text-sm">{swap.requester?.full_name} needs a cover</p>
                    {swap.reason && <p className="text-xs text-muted-foreground italic">&ldquo;{swap.reason}&rdquo;</p>}
                  </div>
                  {swap.shift && (
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p className="font-medium text-foreground">{swap.shift.title}</p>
                      <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatShiftDate(swap.shift.start_time)}</p>
                      <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}</p>
                    </div>
                  )}
                  <WorkerSwapActions swapId={swap.id} userId={user.id} mode="offer" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          My requests ({myRequests.length})
        </h2>
        {myRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
              You haven&apos;t requested any swaps yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myRequests.map((swap) => (
              <Card key={swap.id}>
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{swap.shift?.title ?? "Shift"}</p>
                    <Badge variant="outline" className="text-xs shrink-0 capitalize">{swap.status.replace("_", " ")}</Badge>
                  </div>
                  {swap.shift && (
                    <p className="text-xs text-muted-foreground">
                      {formatShiftDate(swap.shift.start_time)} · {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}
                    </p>
                  )}
                  {swap.covering_worker && (
                    <p className="text-xs text-muted-foreground">Cover: {swap.covering_worker.full_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{timeAgo(swap.requested_at)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
