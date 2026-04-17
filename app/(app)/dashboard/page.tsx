import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { calculateROI, groupSwapsByWeek } from "@/lib/analytics";
import { getTrialStatus } from "@/lib/trial";
import { cn, formatCurrency, formatShiftDate, formatShiftTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  TrendingUp, DollarSign, Clock, RefreshCw, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Calendar,
} from "lucide-react";
import { ApproveSwapButton } from "@/components/dashboard/ApproveSwapButton";
import { SwapChart } from "@/components/dashboard/SwapChart";



export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single();

  const org = (profile as any)?.organization;
  const orgId = profile?.organization_id ?? "";

  // Fetch all dashboard data in parallel
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const in48h = new Date();
  in48h.setHours(in48h.getHours() + 48);

  const [{ data: swapsData }, { data: pendingSwapsData }, { data: atRiskShiftsData }] = await Promise.all([
    // Swap data (last 30 days)
    supabase
      .from("swap_requests")
      .select("*")
      .eq("organization_id", orgId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false }),
    // Pending swaps (need manager approval)
    supabase
      .from("swap_requests")
      .select("*, shift:shifts(*, department:departments(*)), requester:profiles!swap_requests_requester_id_fkey(*), covering_worker:profiles!swap_requests_covering_worker_id_fkey(*)")
      .eq("organization_id", orgId)
      .eq("status", "worker_accepted")
      .order("requested_at", { ascending: false })
      .limit(5),
    // At-risk shifts (open or swap_pending within 48h)
    supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(*)")
      .eq("organization_id", orgId)
      .in("status", ["open", "swap_pending"])
      .lte("start_time", in48h.toISOString())
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5),
  ]);

  const swaps = (swapsData ?? []) as any[];
  const pendingSwaps = (pendingSwapsData ?? []) as any[];
  const atRiskShifts = (atRiskShiftsData ?? []) as any[];

  const metrics = calculateROI(swaps as any);
  const weeklyData = groupSwapsByWeek(swaps as any);
  const trialStatus = getTrialStatus(org);

  const kpis = [
    {
      title: "Swap Fulfillment Rate",
      value: `${metrics.fulfillmentRate}%`,
      sub: `${metrics.totalSwapsFulfilled} of ${metrics.totalSwapsRequested} requests fulfilled`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Cost Savings",
      value: formatCurrency(metrics.costSavings),
      sub: "vs. overtime & agency fees (30 days)",
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Manager Time Saved",
      value: `${metrics.managerHoursSaved.toFixed(1)}h`,
      sub: "vs. manual phone coordination",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Swaps",
      value: metrics.activeSwaps.toString(),
      sub: "in progress right now",
      icon: RefreshCw,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Manager Dashboard</h1>
          <p className="text-white/40 text-sm font-medium tracking-wide uppercase">
            30-Day Performance Overview · <span className="text-gold/60">{org?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass border-white/5 rounded-full text-xs font-bold uppercase tracking-widest px-6 h-10 hover:bg-white/5">
            Export Report
          </Button>
          <Button className="btn-gold rounded-full text-xs font-bold uppercase tracking-widest px-6 h-10 shadow-lg shadow-gold/20">
            Post Shift
          </Button>
        </div>
      </div>

      {/* Trial progress */}
      {trialStatus.isOnTrial && (
        <div className="mx-2">
          <div className="glass rounded-[2rem] border-gold/20 p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10 group-hover:bg-gold/10 transition-colors duration-500" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-black uppercase tracking-widest text-gold">Trial Status</span>
                  <span className="text-xs font-bold text-white/40">{trialStatus.daysRemaining} days left</span>
                </div>
                <Progress value={trialStatus.percentUsed} className="h-2.5 bg-white/5 [&>div]:bg-gold shadow-inner" />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <p className="text-sm font-medium text-white/60 hidden lg:block">Enjoying SwapBoard? Upgrade now for unlimited features.</p>
                <Button size="lg" className="btn-gold rounded-full px-8 text-xs font-black uppercase tracking-widest w-full md:w-auto" asChild>
                  <Link href="/settings?tab=billing">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="card-premium p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] blur-2xl group-hover:bg-gold/[0.05] transition-colors" />
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg.replace('bg-', 'bg-gold/').replace('50', '10')} flex items-center justify-center mb-6 border border-white/5`}>
              <kpi.icon className="w-6 h-6 text-gold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">{kpi.title}</h3>
              <p className="text-4xl font-black text-white tabular-nums tracking-tighter">{kpi.value}</p>
              <p className="text-[11px] text-white/40 font-medium leading-relaxed mt-2">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8 px-2">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card-premium p-8 rounded-[2.5rem] relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white mb-1">Swap Activity</h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">Fulfillment Trends · 4 Weeks</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-[10px] font-bold text-white/40 uppercase">Requested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-[10px] font-bold text-white/40 uppercase">Fulfilled</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <SwapChart data={weeklyData} />
            </div>
          </div>

          {/* At-risk shifts */}
          {atRiskShifts.length > 0 && (
            <div className="glass rounded-[2.5rem] p-8 border-gold/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white mb-1">Critical Shifts</h2>
                    <p className="text-[11px] text-red-500/60 font-bold uppercase tracking-widest">Required Action Within 48h</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {(atRiskShifts as any[]).map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-white mb-1">{shift.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-white/40 font-medium">
                        <span>{formatShiftDate(shift.start_time)}</span>
                        <span>·</span>
                        <span>{formatShiftTime(shift.start_time, shift.end_time)}</span>
                        {shift.department && (
                          <>
                            <span>·</span>
                            <span className="text-gold/60">{shift.department.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                      shift.status === "open" ? "bg-red-500/20 text-red-400" : "bg-gold/20 text-gold"
                    )}>
                      {shift.status === "open" ? "Open" : "Swap Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column: Pending Approvals */}
        <div className="lg:col-span-1">
          <div className="card-premium p-8 rounded-[2.5rem] h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-black tracking-tight text-white mb-1">Queue</h2>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">Pending Approvals</p>
              </div>
              {pendingSwaps.length > 0 && (
                <Link href="/swaps?status=worker_accepted" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {pendingSwaps.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm mb-1 uppercase tracking-widest">Clear Queue</h3>
                  <p className="text-xs font-medium">All swaps have been processed.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(pendingSwaps as any[]).map((swap) => (
                    <div key={swap.id} className="group relative">
                      <div className="flex flex-col gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[10px] font-black border border-gold/10">
                              {swap.requester?.full_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <p className="text-sm font-bold truncate leading-tight">{swap.requester?.full_name}</p>
                              <p className="text-[10px] text-white/30 font-bold uppercase">Requester</p>
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-white/20" />
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex flex-col items-end min-w-0">
                              <p className="text-sm font-bold truncate leading-tight">{swap.covering_worker?.full_name}</p>
                              <p className="text-[10px] text-white/30 font-bold uppercase">Cover</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 text-[10px] font-black">
                              {swap.covering_worker?.full_name?.charAt(0) ?? "?"}
                            </div>
                          </div>
                        </div>

                        <div className="h-[1px] w-full bg-white/5" />

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {swap.shift ? `${formatShiftDate(swap.shift.start_time)} · ${formatShiftTime(swap.shift.start_time, swap.shift.end_time)}` : "No shift data"}
                          </div>
                          {swap.reason && (
                            <p className="text-xs text-white/50 italic bg-white/[0.03] p-3 rounded-xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                              "{swap.reason}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2">
                          <ApproveSwapButton swapId={swap.id} />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {pendingSwaps.length >= 5 && (
                    <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-gold" asChild>
                      <Link href="/swaps?status=worker_accepted">View All Pending Requests</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
