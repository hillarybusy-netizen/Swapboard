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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Swap Requests</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Manage Cover & Exchanges</p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gold/60">Available to Cover</h2>
          <span className="text-[10px] font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full">{availableSwaps.length} Requests</span>
        </div>

        {availableSwaps.length === 0 ? (
          <div className="glass rounded-[2.5rem] p-12 text-center border-white/5">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <ArrowLeftRight className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-widest">Quiet Day</h3>
            <p className="text-xs text-white/30 font-medium">No open swap requests right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableSwaps.map((swap) => (
              <div key={swap.id} className="glass rounded-[2.5rem] p-6 border-gold/20 bg-gold/5 relative overflow-hidden group shadow-xl shadow-gold/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-3xl -z-10 group-hover:bg-gold/20 transition-colors duration-500" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-black border border-gold/20">
                      {swap.requester?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{swap.requester?.full_name} <span className="text-white/40 font-medium">needs cover</span></p>
                      {swap.reason && <p className="text-[11px] text-gold/60 font-medium italic mt-0.5">&ldquo;{swap.reason}&rdquo;</p>}
                    </div>
                  </div>

                  {swap.shift && (
                    <div className="p-4 rounded-2xl bg-[#050505]/40 border border-white/5 space-y-3">
                      <p className="text-sm font-bold text-white">{swap.shift.title}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" /> {formatShiftDate(swap.shift.start_time)}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" /> {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <WorkerSwapActions swapId={swap.id} userId={user.id} mode="offer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pt-4 border-t border-white/5">
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white/20">My Requests</h2>
          <span className="text-[10px] font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full">{myRequests.length}</span>
        </div>

        {myRequests.length === 0 ? (
          <div className="text-center py-12 opacity-30">
            <p className="text-xs font-bold uppercase tracking-widest">No Requests Made</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((swap) => (
              <div key={swap.id} className="glass rounded-[2rem] p-6 border-white/5 transition-all duration-300">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{swap.shift?.title ?? "Shift"}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className="rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest bg-white/10 text-white/60 border-none">
                        {swap.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{timeAgo(swap.requested_at)}</span>
                    </div>
                  </div>
                </div>

                {swap.shift && (
                  <div className="flex items-center gap-4 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatShiftDate(swap.shift.start_time)}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatShiftTime(swap.shift.start_time, swap.shift.end_time)}</span>
                  </div>
                )}

                {swap.covering_worker && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[9px] font-black border border-gold/10">
                      {swap.covering_worker.full_name?.charAt(0)}
                    </div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Cover: {swap.covering_worker.full_name}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
