import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, timeAgo, SWAP_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftRight, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, any> = {
  pending: "warning",
  worker_accepted: "info",
  manager_approved: "success",
  rejected: "destructive",
  cancelled: "secondary",
};

export default async function SwapsPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("organization_id, user_role").eq("id", user.id).single();
  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const { data: allSwapsData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(*, department:departments(*)), requester:profiles!swap_requests_requester_id_fkey(*), covering_worker:profiles!swap_requests_covering_worker_id_fkey(*)")
    .eq("organization_id", orgId)
    .order("requested_at", { ascending: false });

  const allSwaps = (allSwapsData ?? []) as any[];
  const pending = allSwaps.filter((s) => s.status === "pending" || s.status === "worker_accepted");
  const history = allSwaps.filter((s) => ["manager_approved", "rejected", "cancelled"].includes(s.status));

  function SwapCard({ swap }: { swap: any }) {
    return (
      <Link href={`/swaps/${swap.id}`}>
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="w-8 h-8 mt-0.5 shrink-0">
                  <AvatarFallback className="text-xs">{swap.requester?.full_name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    {swap.requester?.full_name ?? "Unknown"} requested a swap
                  </p>
                  {swap.shift && (
                    <p className="text-xs text-muted-foreground">
                      {swap.shift.title} · {formatShiftDate(swap.shift.start_time)} · {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}
                      {swap.shift.department && ` · ${swap.shift.department.name}`}
                    </p>
                  )}
                  {swap.covering_worker && (
                    <p className="text-xs text-muted-foreground">Cover: {swap.covering_worker.full_name}</p>
                  )}
                  {swap.reason && <p className="text-xs text-muted-foreground italic mt-0.5">"{swap.reason}"</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge variant={STATUS_BADGE[swap.status] ?? "outline"}>
                  {SWAP_STATUS_LABELS[swap.status] ?? swap.status}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(swap.requested_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Swap Requests</h1>
        <p className="text-muted-foreground text-sm">{allSwaps.length} total</p>
      </div>

      <Tabs defaultValue={searchParams.status === "worker_accepted" ? "pending" : "pending"}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pending.length > 0 && <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pending.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No pending swap requests</p>
            </div>
          ) : (
            pending.map((swap) => <SwapCard key={swap.id} swap={swap} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {history.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No completed swaps yet</p>
            </div>
          ) : (
            history.map((swap) => <SwapCard key={swap.id} swap={swap} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
