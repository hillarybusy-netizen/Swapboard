import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime, formatShiftDuration, SHIFT_STATUS_LABELS, cn } from "@/lib/utils";
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

export default async function ShiftsPage(props: {
  searchParams: Promise<{ dept?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
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
    .select(`
      *,
      department:departments(*),
      profile:profiles!shifts_user_id_fkey(id, full_name)
    `)
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
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Team Shifts</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Schedule Overview · <span className="text-gold/60">{shifts.length} Active Records</span>
          </p>
        </div>
        {isManager && (
          <div className="flex items-center gap-3">
             <AddShiftDialog departments={departments as any} profiles={profiles as any} orgId={orgId} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 px-2">
        <Link href="/shifts">
          <Button 
            variant="outline" 
            className={cn(
              "glass rounded-full text-[10px] font-black uppercase tracking-widest px-6 h-10 border-white/5",
              !searchParams.dept && !searchParams.status ? "bg-gold text-[#050505] border-gold" : "text-white/40 hover:text-white"
            )}
            size="sm"
          >
            All Shifts
          </Button>
        </Link>
        {(departments as any[]).map((d) => (
          <Link key={d.id} href={`/shifts?dept=${d.id}`}>
            <Button 
              variant="outline" 
              className={cn(
               "glass rounded-full text-[10px] font-black uppercase tracking-widest px-6 h-10 border-white/5",
                searchParams.dept === d.id ? "bg-gold text-[#050505] border-gold" : "text-white/40 hover:text-white"
              )}
              size="sm"
            >
              <span className="w-2 h-2 rounded-full mr-2 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: d.color }} />
              {d.name}
            </Button>
          </Link>
        ))}
        <Link href="/shifts?status=open">
          <Button 
            variant="outline" 
            className={cn(
              "glass rounded-full text-[10px] font-black uppercase tracking-widest px-6 h-10 border-white/5",
              searchParams.status === "open" ? "bg-red-500 text-white border-red-500" : "text-white/40 hover:text-white"
            )}
            size="sm"
          >
            Open Only
          </Button>
        </Link>
      </div>

      {/* Shifts list */}
      {shifts.length === 0 ? (
        <div className="px-2">
          <div className="glass rounded-[2.5rem] p-20 text-center border-white/5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Calendar className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest tracking-tighter">No Shifts Found</h3>
            <p className="text-sm text-white/30 font-medium mb-10 max-w-xs mx-auto">Create your first shift to start coordinating your team.</p>
            {isManager && <AddShiftDialog departments={departments as any} profiles={profiles as any} orgId={orgId} />}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 px-2">
          {(shifts as any[]).map((shift) => (
            <Link key={shift.id} href={`/shifts/${shift.id}`} className="group">
              <div className="glass rounded-[2rem] p-6 border-white/5 hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl group-hover:bg-gold/[0.03] -z-10 transition-colors" />
                
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="flex flex-1 items-center gap-6 min-w-0">
                    {shift.department && (
                      <div className="w-1.5 h-12 rounded-full shrink-0 shadow-[0_0_12px_rgba(0,0,0,0.3)] transition-transform group-hover:scale-y-110" style={{ backgroundColor: shift.department.color }} />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-black tracking-tight text-white truncate">{shift.title}</h3>
                        {shift.department && (
                          <Badge className="bg-white/5 text-white/30 rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border-none">
                            {shift.department.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-[11px] font-bold text-white/40 uppercase tracking-[0.1em]">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gold/60" />
                          {formatShiftDate(shift.start_time)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gold/60" />
                          {formatShiftTime(shift.start_time, shift.end_time)} <span className="text-white/10 ml-1">· {formatShiftDuration(shift.start_time, shift.end_time)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 shrink-0">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Assigned To</span>
                      {shift.profile ? (
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-full ring-2 ring-white/5">
                            <AvatarFallback className="bg-gold/10 text-gold text-xs font-black">
                              {shift.profile.full_name?.charAt(0) ?? "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold text-white/80">{shift.profile.full_name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                          <Users className="w-3 h-3 text-red-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Unassigned</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Status</span>
                      <Badge className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none shadow-lg",
                        shift.status === "scheduled" ? "bg-gold text-[#050505] shadow-gold/20" : 
                        shift.status === "open" ? "bg-red-500/20 text-red-400 shadow-red-500/10" :
                        "bg-blue-500/20 text-blue-400 shadow-blue-500/10"
                      )}>
                        {SHIFT_STATUS_LABELS[shift.status] ?? shift.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
