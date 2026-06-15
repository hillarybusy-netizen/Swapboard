import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { formatShiftDate, formatShiftTime } from "@/lib/utils";
import { Calendar, Clock, PlusCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { RequestSwapButton } from "@/components/shifts/RequestSwapButton";
import { WorkerSwapActions } from "@/components/swaps/WorkerSwapActions";

export const dynamic = "force-dynamic";

export default async function MyShiftsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const orgId = profile?.organization_id;
  const deptId = profile?.department_id;

  const currentTab = searchParams.tab || "my-shifts";

  // For the greeting
  const firstName = profile?.full_name?.split(" ")[0] || "User";
  const orgName = (profile as any)?.organization?.name || "the team";

  // Calculate Profile Completion
  let completedFields = 0;
  const totalFields = 4;
  if (profile?.full_name) completedFields++;
  if (profile?.phone) completedFields++;
  if (profile?.department_id) completedFields++;
  if (profile?.organization_id) completedFields++;
  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  const now = new Date().toISOString();

  // Queries
  const [upcomingRes, pastRes, availableRes, mySwapsRes] = await Promise.all([
    supabase
      .from("shifts")
      .select("*, department:departments(*)")
      .eq("assigned_to", user.id)
      .gte("start_time", now)
      .order("start_time", { ascending: true }),
    supabase
      .from("shifts")
      .select("*, department:departments(*)")
      .eq("assigned_to", user.id)
      .lt("start_time", now)
      .order("start_time", { ascending: false })
      .limit(20),
    supabase
      .from("swap_requests")
      .select("*, shift:shifts(*, department:departments(*)), requester:profiles!swap_requests_requester_id_fkey(*)")
      .eq("organization_id", orgId ?? "")
      .eq("status", "pending")
      .neq("requester_id", user.id)
      .is("covering_worker_id", null)
      .order("requested_at", { ascending: false }),
    supabase
      .from("swap_requests")
      .select("id, status")
      .eq("requester_id", user.id)
  ]);

  const upcomingShifts = (upcomingRes.data ?? []) as any[];
  const pastShifts = (pastRes.data ?? []) as any[];
  const availableSwaps = (availableRes.data ?? []) as any[];
  const mySwaps = (mySwapsRes.data ?? []) as any[];

  // Stats logic
  const availableCount = availableSwaps.length;
  const mySwapsCount = mySwaps.length;
  const pendingCount = mySwaps.filter(s => s.status === "pending" || s.status === "worker_accepted").length;

  let displayList: any[] = [];
  if (currentTab === "my-shifts") displayList = upcomingShifts;
  else if (currentTab === "history") displayList = pastShifts;
  else if (currentTab === "available") displayList = availableSwaps;

  function ShiftCard({ shift }: { shift: any }) {
    const isAssignedToMe = shift.assigned_to === user!.id;
    const canSwap = isAssignedToMe && shift.status === "scheduled";
    
    let statusText = "Confirmed";
    let statusColor = "text-emerald-500 bg-emerald-500/10";
    
    if (shift.status === "swap_pending") {
      statusText = "Swap Pending";
      statusColor = "text-orange-500 bg-orange-500/10";
    } else if (shift.status === "open") {
      statusText = "Open";
      statusColor = "text-red-500 bg-red-500/10";
    } else if (shift.status === "pending_completion") {
      statusText = "Awaiting Confirmation";
      statusColor = "text-blue-500 bg-blue-500/10";
    } else if (shift.status === "completed") {
      statusText = "Completed";
      statusColor = "text-emerald-500 bg-emerald-500/10";
    }

    return (
      <div className="glass rounded-[1.5rem] p-5 border border-white/5 relative overflow-hidden mb-4 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{formatShiftDate(shift.start_time)}</h3>
            <div className="flex items-center text-xs text-white/50 mt-1 font-medium">
              <span>{formatShiftTime(shift.start_time, shift.end_time)}</span>
              {shift.department && (
                <>
                  <span className="mx-2">•</span>
                  <span>{shift.department.name}</span>
                </>
              )}
            </div>
          </div>
          <div className={cn("px-3 py-1.5 rounded-lg text-xs font-bold", statusColor)}>
            {statusText}
          </div>
        </div>

        {canSwap && (
          <div className="mt-2" id={`shift-${shift.id}`}>
            <RequestSwapButton shiftId={shift.id} shiftTitle={shift.title} />
          </div>
        )}
      </div>
    );
  }

  function SwapCard({ swap }: { swap: any }) {
    return (
      <div className="glass rounded-[1.5rem] p-5 border-gold/20 bg-gold/5 relative overflow-hidden mb-4 shadow-xl shadow-gold/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-3xl -z-10 transition-colors duration-500" />
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
            <WorkerSwapActions swapId={swap.id} mode="offer" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* Greeting */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Hey {firstName} <span className="text-2xl">👋</span>
        </h1>
        <p className="text-sm text-white/50 font-medium leading-relaxed">
          Welcome to {orgName}! Post your shift when you need time off — someone's always got your back.
        </p>
      </div>

      {/* Profile Completion */}
      <div className="glass rounded-2xl p-5 border border-gold/20 relative overflow-hidden group shadow-lg">
        <div className="absolute right-0 top-0 w-32 h-32 bg-gold/5 blur-2xl group-hover:bg-gold/10 transition-all" />
        <div className="flex justify-between items-end mb-3 relative z-10">
          <span className="text-sm font-bold text-gold">Complete your profile</span>
          <span className="text-xs font-bold text-white/50">{profileCompletion}%</span>
        </div>
        <Progress value={profileCompletion} className="h-1.5 bg-white/10 [&>div]:bg-gold mb-3 relative z-10" />
        <p className="text-xs text-white/50 font-medium relative z-10">
          Set your availability so we can match you with shifts
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="#shift-list" className="rounded-2xl bg-gold p-6 flex flex-col items-center justify-center gap-3 shadow-lg shadow-gold/10 hover:scale-105 transition-transform text-center">
          <PlusCircle className="w-8 h-8 text-[#050505]" strokeWidth={1.5} />
          <span className="text-xs font-bold text-[#050505]">Post a Shift for Swap</span>
        </Link>
        
        <Link href="/swap-requests" className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 border border-white/10 hover:bg-white/5 hover:scale-105 transition-all shadow-lg text-center">
          <Search className="w-8 h-8 text-gold" strokeWidth={1.5} />
          <span className="text-xs font-bold text-gold">Check Available Shifts</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 shadow-lg">
          <span className="text-2xl font-black text-emerald-500 mb-1">{availableCount}</span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Available</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 shadow-lg">
          <span className="text-2xl font-black text-gold mb-1">{mySwapsCount}</span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">My Swaps</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center border border-white/5 shadow-lg">
          <span className="text-2xl font-black text-orange-500 mb-1">{pendingCount}</span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Pending</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-full p-1.5 flex items-center justify-between border border-white/5 shadow-lg">
        <Link 
          href="?tab=available" 
          className={cn(
            "flex-1 py-3 rounded-full text-[10px] font-bold flex items-center justify-center gap-2 transition-all",
            currentTab === "available" ? "bg-gold text-[#050505] shadow-md" : "text-white/50 hover:text-white"
          )}
        >
          Available Shifts
          <span className={cn(
            "w-4 h-4 rounded-full flex items-center justify-center text-[9px]",
            currentTab === "available" ? "bg-[#050505]/20 text-[#050505]" : "bg-gold/20 text-gold"
          )}>
            {availableCount}
          </span>
        </Link>
        <Link 
          href="?tab=my-shifts" 
          className={cn(
            "flex-1 py-3 rounded-full text-[10px] font-bold transition-all text-center",
            currentTab === "my-shifts" ? "bg-gold text-[#050505] shadow-md" : "text-white/50 hover:text-white"
          )}
        >
          My Shifts
        </Link>
        <Link 
          href="?tab=history" 
          className={cn(
            "flex-1 py-3 rounded-full text-[10px] font-bold transition-all text-center",
            currentTab === "history" ? "bg-gold text-[#050505] shadow-md" : "text-white/50 hover:text-white"
          )}
        >
          History
        </Link>
      </div>

      {/* List */}
      <div className="pt-2" id="shift-list">
        {currentTab === "my-shifts" || currentTab === "history" ? (
          displayList.map((s) => <ShiftCard key={s.id} shift={s} />)
        ) : (
          displayList.map((s) => <SwapCard key={s.id} swap={s} />)
        )}
        
        {/* Empty States */}
        {displayList.length === 0 && (
          <div className="glass rounded-[1.5rem] p-10 text-center border-white/5 shadow-lg">
             <Calendar className="w-8 h-8 text-white/20 mx-auto mb-4" />
             <h3 className="text-sm font-bold text-white mb-1">Nothing to show</h3>
             <p className="text-xs text-white/40">You're all caught up for now.</p>
          </div>
        )}
      </div>

    </div>
  );
}
