import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { formatShiftDate, formatShiftTime, timeAgo, SWAP_STATUS_LABELS, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { SwapActionButtons } from "@/components/swaps/SwapActionButtons";

export const dynamic = "force-dynamic";

export default async function SwapDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: swap } = await supabase
    .from("swap_requests")
    .select(`
      *,
      shift:shifts(*, department:departments(*)),
      requester:profiles!swap_requests_requester_id_fkey(*),
      covering_worker:profiles!swap_requests_covering_worker_id_fkey(*),
      approver:profiles!swap_requests_approved_by_fkey(*)
    `)
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

  const timeline = [
    { label: "Swap requested", time: swap.requested_at },
    swap.worker_responded_at && { label: covering ? `${covering.full_name} accepted` : "Worker responded", time: swap.worker_responded_at },
    swap.manager_responded_at && { label: swap.status === "manager_approved" ? "Manager approved" : "Manager rejected", time: swap.manager_responded_at },
  ].filter(Boolean) as { label: string; time: string }[];

  return (
    <div className="max-w-3xl space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/swaps" className="group flex items-center gap-2 text-white/40 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-all">
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Records
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Swap Request</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">ID: {swap.id.split('-')[0]}</p>
          </div>
        </div>
        <Badge className={cn(
          "rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest border-none shadow-xl",
          swap.status === "manager_approved" ? "bg-gold text-[#050505]" : "bg-white/10 text-white/60"
        )}>
          {SWAP_STATUS_LABELS[swap.status] ?? swap.status}
        </Badge>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          {/* Shift Details */}
          <div className="glass rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl -z-10" />
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-6">Shift details</h3>
             {shift && (
              <div className="space-y-6">
                <h4 className="text-xl font-black text-white">{shift.title}</h4>
                <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gold/40" />
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{formatShiftDate(shift.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gold/40" />
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{formatShiftTime(shift.start_time, shift.end_time)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* People & Roles */}
          <div className="glass rounded-[2.5rem] p-8 border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-8">Participants</h3>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 rounded-full border-2 border-white/5">
                  <AvatarFallback className="bg-gold/10 text-gold text-xs font-black italic">{requester?.full_name?.charAt(0) ?? "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-black text-white">{requester?.full_name ?? "Unknown"}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 italic">Requester {swap.reason && `· "${swap.reason}"`}</p>
                </div>
              </div>
              
              {covering && (
                <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                  <Avatar className="w-12 h-12 rounded-full border-2 border-white/5">
                    <AvatarFallback className="bg-white/5 text-white/30 text-xs font-black italic">{covering.full_name?.charAt(0) ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-black text-white">{covering.full_name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 italic">Covering Partner</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* History Timeline */}
          <div className="glass rounded-[2.5rem] p-8 border-white/5 bg-white/[0.01]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-8">Coordination History</h3>
            <div className="space-y-10 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/5" />
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className="w-3.5 h-3.5 rounded-full bg-gold border-[3px] border-[#050505] shadow-[0_0_8px_rgba(212,175,55,0.4)] z-10 mt-1 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest leading-none">{event.label}</p>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.1em]">{timeAgo(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
             <SwapActionButtons swap={swap as any} userId={user.id} isManager={isManager} isRequester={isRequester} isCovering={isCovering} />
          </div>
        </div>
      </div>
    </div>
  );
}
