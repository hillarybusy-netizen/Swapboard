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

import { cn } from "@/lib/utils";

export default async function ShiftDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: shift } = await supabase
    .from("shifts")
    .select("*, department:departments(*), role:roles(*), profile:profiles!shifts_user_id_fkey(*), creator:profiles!shifts_created_by_fkey(*)")
    .eq("id", params.id)
    .single();

  if (!shift) notFound();

  const { data: profile } = await supabase.from("profiles").select("organization_id, user_role").eq("id", user.id).single();
  const isManager = profile?.user_role === "manager" || profile?.user_role === "admin";
  const isOwner = shift.assigned_to === user.id;

  return (
    <div className="max-w-3xl space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/shifts" className="group flex items-center gap-2 text-white/40 hover:text-gold text-[10px] font-black uppercase tracking-[0.2em] transition-all">
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
      </Link>

      <div className="glass rounded-[3rem] p-10 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-3xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight text-white leading-tight">{shift.title}</h1>
            {shift.department && (
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: (shift.department as any).color }} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">{(shift.department as any).name}</span>
              </div>
            )}
          </div>
          <Badge className={cn(
            "rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest border-none shadow-xl",
            shift.status === "scheduled" ? "bg-gold text-[#050505]" : "bg-white/10 text-white/60"
          )}>
            {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold/60">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">{formatShiftDate(shift.start_time)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Date</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gold/60">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-white">{formatShiftTime(shift.start_time, shift.end_time)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{formatShiftDuration(shift.start_time, shift.end_time)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-white/5 border border-white/5">
            <Avatar className="w-14 h-14 rounded-full border-2 border-white/10 ring-4 ring-white/[0.02]">
              <AvatarFallback className="bg-gold/10 text-gold text-lg font-black italic">
                {(shift.profile as any)?.full_name?.charAt(0) ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-black text-white">{(shift.profile as any)?.full_name ?? "Unassigned"}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Assigned Partner</p>
            </div>
          </div>

          {shift.notes && (
            <div className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 border-dashed">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">Notes & Instructions</p>
              <p className="text-sm text-white/60 font-medium leading-relaxed italic">&ldquo;{shift.notes}&rdquo;</p>
            </div>
          )}

          {(isOwner || isManager) && shift.status === "scheduled" && (
            <div className="pt-6 border-t border-white/5">
              {isOwner && <RequestSwapButton shiftId={shift.id} shiftTitle={shift.title} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
