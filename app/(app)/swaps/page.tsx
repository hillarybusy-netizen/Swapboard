import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, timeAgo, SWAP_STATUS_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftRight, Clock, Calendar } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, any> = {
  pending: "warning",
  worker_accepted: "info",
  manager_approved: "success",
  rejected: "destructive",
  cancelled: "secondary",
};

export default async function SwapsPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("organization_id, user_role").eq("id", user.id).single();
  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const { data: allSwapsData } = await supabase
    .from("swap_requests")
    .select(`
      *,
      shift:shifts(*, department:departments(*)),
      requester:profiles!swap_requests_requester_id_fkey(*),
      covering_worker:profiles!swap_requests_covering_worker_id_fkey(*)
    `)
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
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Swap Requests</h1>
          <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
            Coordination History · <span className="text-gold/60">{allSwaps.length} Total Requests</span>
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="px-1 md:px-2">
        <TabsList className="bg-white/5 p-1 rounded-full border border-white/5 h-11 md:h-12 flex gap-1 w-fit mb-8 md:mb-10">
          <TabsTrigger 
            value="pending" 
            className="rounded-full px-5 md:px-8 data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 transition-all h-full"
          >
            Pending {pending.length > 0 && <span className="ml-2 bg-black/10 px-2 py-0.5 rounded-full">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="rounded-full px-5 md:px-8 data-[state=active]:bg-gold data-[state=active]:text-[#050505] text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/40 data-[state=active]:shadow-lg data-[state=active]:shadow-gold/20 transition-all h-full"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 outline-none">
          {pending.length === 0 ? (
            <div className="glass rounded-[2.5rem] p-20 text-center border-white/5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner text-white/10">
                <ArrowLeftRight className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest tracking-tighter">Queue Empty</h3>
              <p className="text-sm text-white/30 font-medium max-w-xs mx-auto">No pending swap requests requiring your attention.</p>
            </div>
          ) : (
            pending.map((swap) => <SwapCard key={swap.id} swap={swap} />)
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 outline-none">
          {history.length === 0 ? (
            <div className="glass rounded-[2.5rem] p-20 text-center border-white/5 opacity-40">
               <h3 className="text-lg font-black text-white mb-2 uppercase tracking-widest tracking-tighter">No History</h3>
            </div>
          ) : (
            history.map((swap) => <SwapCard key={swap.id} swap={swap} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SwapCard({ swap }: { swap: any }) {
  const isActionRequired = swap.status === "worker_accepted";

  return (
    <Link href={`/swaps/${swap.id}`} className="group block">
      <div className={cn(
        "glass rounded-[2rem] p-6 border-white/5 hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-300 relative overflow-hidden",
        isActionRequired && "border-gold/20 bg-gold/[0.03]"
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl group-hover:bg-gold/[0.03] -z-10 transition-colors" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-1 items-center gap-4 md:gap-6 min-w-0">
            <Avatar className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/5 ring-4 ring-gold/5 group-hover:ring-gold/10 transition-all shrink-0">
              <AvatarFallback className="bg-gold/10 text-gold text-xs md:text-sm font-black italic">
                {swap.requester?.full_name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2 flex-wrap">
                <p className="text-sm md:text-base font-black tracking-tight text-white">{swap.requester?.full_name ?? "Unknown"}</p>
                <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/10" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gold/60">Requested Swap</p>
              </div>

              {swap.shift && (
                <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-bold text-white/30 uppercase tracking-[0.1em] flex-wrap">
                  <span className="text-white/60 font-black truncate max-w-[120px] md:max-w-none">{swap.shift.title}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatShiftDate(swap.shift.start_time)}</span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-8 shrink-0 border-t border-white/5 sm:border-none pt-4 sm:pt-0">
            {swap.covering_worker && (
              <div className="flex flex-col items-start sm:items-end gap-1.5 pr-6 md:pr-8 border-r border-white/5">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/20 italic">Covering Partner</span>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[11px] md:text-xs font-bold text-white/80">{swap.covering_worker.full_name}</span>
                  <Avatar className="w-6 h-6 md:w-7 md:h-7 rounded-full opacity-60">
                    <AvatarFallback className="bg-white/5 text-white/40 text-[9px] md:text-[10px] font-black">
                       {swap.covering_worker.full_name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )}

            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-white/20" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] text-white/20">{timeAgo(swap.requested_at)}</span>
              </div>
              <Badge className={cn(
                "rounded-full px-3 md:px-4 py-1 md:py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none shadow-lg",
                isActionRequired ? "bg-gold text-[#050505] shadow-gold/20" : "bg-white/10 text-white/60"
              )}>
                {SWAP_STATUS_LABELS[swap.status] ?? swap.status}
              </Badge>
            </div>
          </div>
        </div>

        {swap.reason && (
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-colors">
            <p className="text-xs text-white/40 font-medium italic">&ldquo;{swap.reason}&rdquo;</p>
          </div>
        )}
      </div>
    </Link>
  );
}
