import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
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
  TrendingUp, DollarSign, Clock, RefreshCw, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Calendar, UserPlus,
} from "lucide-react";
import { ApproveSwapButton } from "@/components/dashboard/ApproveSwapButton";
import { ApproveClaimButton } from "@/components/shifts/ApproveClaimButton";
import { SwapChartLazy } from "@/components/dashboard/SwapChartLazy";
import { Lock } from "lucide-react";
import { ExportReportButton } from "@/components/dashboard/ExportReportButton";
import { AddShiftDialog } from "@/components/shifts/AddShiftDialog";
import { ConfirmCompletionButton } from "@/components/shifts/ConfirmCompletionButton";
import { checkPlanLimit } from "@/lib/plans";



export const revalidate = 0;

export default async function DashboardPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  if (profile?.user_role === "worker") {
    redirect("/my-shifts");
  }

  const supabase = await createClient();
  const org = (profile as any)?.organization;
  const orgId = profile?.organization_id ?? "";

  // Scope queries for Manager
  const isManager = profile?.user_role === "manager";
  const isAdmin = profile?.user_role === "admin";
  const managerDeptIds = profile?.department_ids || [];

  // Get General department for managers
  let generalDeptId: string | null = null;
  if (isManager) {
    const { data: generalDept } = await supabase
      .from("departments")
      .select("id")
      .eq("organization_id", orgId)
      .ilike("name", "general")
      .single();
    generalDeptId = generalDept?.id || null;
  }

  const addDeptScope = (q: any, col = "department_id") => {
    // If manager has departments assigned, filter to those + General
    if (isManager && managerDeptIds.length > 0) {
      const deptFilter = generalDeptId ? [...managerDeptIds, generalDeptId] : managerDeptIds;
      return q.in(col, deptFilter);
    }
    // If manager has NO departments assigned, they're a general manager - show all
    // If admin, show all (no filtering)
    return q;
  };

  const addShiftDeptScope = (q: any) => {
    // If manager has departments assigned, filter to those + General
    if (isManager && managerDeptIds.length > 0) {
      const deptFilter = generalDeptId ? [...managerDeptIds, generalDeptId] : managerDeptIds;
      return q.in("department_id", deptFilter);
    }
    // If manager has NO departments assigned, they're a general manager - show all
    // If admin, show all (no filtering)
    return q;
  };

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const [
    { data: swapsData }, 
    { data: pendingSwapsData }, 
    { data: atRiskShiftsData },
    { data: departmentsData },
    { data: profilesData },
    { data: pendingCompletionsData },
    { data: pendingClaimsData },
  ] = await Promise.all([
    // Swap data (last 30 days)
    supabase
      .from("swap_requests")
      .select("*, shift:shifts!inner(department_id)")
      .eq("organization_id", orgId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .then(res => {
        // Need to filter in JS since we can't easily filter by joined table in the root array using Supabase filter simply without !inner, wait !inner is used. Let's adjust query
        let q = supabase.from("swap_requests").select("*, shift:shifts!inner(department_id)").eq("organization_id", orgId).gte("created_at", since.toISOString()).order("created_at", { ascending: false });
        if (isManager && managerDeptIds.length > 0) {
          const deptFilter = generalDeptId ? [...managerDeptIds, generalDeptId] : managerDeptIds;
          q = q.in("shift.department_id", deptFilter) as any;
        } else if (isManager) {
          q = generalDeptId ? q.eq("shift.department_id", generalDeptId) as any : q.eq("shift.department_id", "00000000-0000-0000-0000-000000000000") as any;
        }
        return q;
      }),
    // Pending swaps (need manager approval)
    (async () => {
      let q = supabase
        .from("swap_requests")
        .select("*, shift:shifts(*, department:departments(*)), requester:profiles!requester_id(*), covering_worker:profiles!covering_worker_id(*)")
        .eq("organization_id", orgId)
        .eq("status", "worker_accepted")
        .order("requested_at", { ascending: false })
        .limit(5);
      if (isManager && managerDeptIds.length > 0) {
        const deptFilter = generalDeptId ? [...managerDeptIds, generalDeptId] : managerDeptIds;
        q = q.in("shift.department_id", deptFilter) as any;
      } else if (isManager) {
        q = generalDeptId ? q.eq("shift.department_id", generalDeptId) as any : q.eq("shift.department_id", "00000000-0000-0000-0000-000000000000") as any;
      }
      return q;
    })(),
    // At-risk shifts (unassigned or swap_pending within 48h)
    addShiftDeptScope(supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(*)")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .in("status", ["not_started", "up_for_swap", "pending_approval_swap"])
      .lte("start_time", in48h.toISOString())
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5)),
    // Departments for PostShiftDialog
    addDeptScope(supabase
      .from("departments")
      .select("*")
      .eq("organization_id", orgId)
      .order("name"), "id"),
    // Profiles for PostShiftDialog (only workers)
    addDeptScope(supabase
      .from("profiles")
      .select("id, full_name, department_id")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .eq("user_role", "worker")
      .order("full_name"), "department_id"),
    // Shifts awaiting completion confirmation
    addShiftDeptScope(supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(full_name)")
      .eq("organization_id", orgId)
      .eq("status", "done_pending_approval")
      .is("deleted_at", null)
      .order("end_time", { ascending: false })
      .limit(5)),
    // Shifts awaiting claim approval
    addShiftDeptScope(supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(full_name)")
      .eq("organization_id", orgId)
      .eq("status", "pending_approval_claim")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5)),
  ]);

  const swaps = (swapsData ?? []) as any[];
  const pendingSwaps = (pendingSwapsData ?? []) as any[];
  const atRiskShifts = (atRiskShiftsData ?? []) as any[];
  const departments = (departmentsData ?? []) as any[];
  const profiles = (profilesData ?? []) as any[];
  const pendingCompletions = (pendingCompletionsData ?? []) as any[];
  const pendingClaims = (pendingClaimsData ?? []) as any[];

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">{isAdmin ? "Admin" : "Manager"} Dashboard</h1>
          <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-wide uppercase">
            30-Day Performance Overview · <span className="text-gold/60">{org?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportReportButton data={{ metrics, swaps, orgName: org?.name ?? "Organization" }} />
          <AddShiftDialog orgId={orgId} departments={departments} profiles={profiles} />
        </div>
      </div>

      {/* Trial progress */}
      {trialStatus.isOnTrial && (
        <div className="mx-1 md:mx-2">
          <div className="glass rounded-[1.5rem] md:rounded-[2rem] border-gold/20 p-5 md:p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10 group-hover:bg-gold/10 transition-colors duration-500" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gold text-glow-gold">Trial Status</span>
                  <span className="text-[10px] md:text-xs font-bold text-white/40">{trialStatus.daysRemaining} days left</span>
                </div>
                <Progress value={trialStatus.percentUsed} className="h-2 md:h-2.5 bg-white/5 [&>div]:bg-gold shadow-inner" />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                <p className="text-sm font-medium text-white/60 hidden lg:block">Enjoying SwapBoard? Upgrade now for unlimited features.</p>
                <Button size="lg" className="btn-gold rounded-full px-8 text-xs font-black uppercase tracking-widest w-full md:w-auto h-12 md:h-auto" asChild>
                  <Link href="/settings?tab=billing">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-1 md:px-2">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] blur-2xl group-hover:bg-gold/[0.05] transition-colors" />
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${kpi.bg.replace('bg-', 'bg-gold/').replace('50', '10')} flex items-center justify-center mb-4 md:mb-6 border border-white/5`}>
              <kpi.icon className="w-5 h-5 md:w-6 md:h-6 text-gold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30">{kpi.title}</h3>
              <p className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">{kpi.value}</p>
              <p className="text-[10px] md:text-[11px] text-white/40 font-medium leading-relaxed mt-1 md:mt-2">{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-1 md:px-2">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden">
            {!checkPlanLimit(org?.plan, "hasROIMetrics") && (
              <div className="absolute inset-0 z-20 bg-[#050505]/40 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
                  <Lock className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">ROI Analytics Locked</h3>
                <p className="text-sm text-white/50 max-w-xs mb-6 font-medium leading-relaxed">Upgrade to the Growth plan to unlock historical trends and deep cost-saving insights.</p>
                <Button className="btn-gold rounded-full px-8" asChild>
                  <Link href="/settings?tab=billing">View Plans</Link>
                </Button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-1">Swap Activity</h2>
                <p className="text-[10px] md:text-[11px] text-white/30 font-bold uppercase tracking-widest">Fulfillment Trends · 4 Weeks</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <span className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase">Requested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-[9px] md:text-[10px] font-bold text-white/40 uppercase">Fulfilled</span>
                </div>
              </div>
            </div>
            <div className="h-[250px] md:h-[300px] w-full">
              <SwapChartLazy data={weeklyData} />
            </div>
          </div>

          {/* At-risk shifts */}
          {atRiskShifts.length > 0 && (
            <div className="glass rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border-gold/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-1">Critical Shifts</h2>
                    <p className="text-[10px] md:text-[11px] text-red-500/60 font-bold uppercase tracking-widest">Required Action Within 48h</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {(atRiskShifts as any[]).map((shift) => (
                  <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group scroll-item">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-white mb-1">{shift.title}</p>
                      <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-white/40 font-medium">
                        <span>{formatShiftDate(shift.start_time)}</span>
                        <span>·</span>
                        <span>{formatShiftTime(shift.start_time, shift.end_time)}</span>
                        {shift.department && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span className="text-gold/60">{shift.department.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-full px-4 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none w-fit",
                      shift.status === "not_started" ? "bg-red-500/20 text-red-400" : "bg-gold/20 text-gold"
                    )}>
                      {shift.status === "not_started" ? "Unassigned" : "Swap Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column: Pending Approvals + Completions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pending Completions */}
          {pendingCompletions.length > 0 && (
            <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-white">Completions</h2>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Awaiting Your Confirmation</p>
                </div>
              </div>
              <div className="space-y-3">
                {pendingCompletions.map((shift: any) => (
                  <div key={shift.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div>
                      <p className="text-sm font-bold text-white truncate">{shift.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {shift.profile?.full_name && <span>{shift.profile.full_name}</span>}
                        {shift.department && (
                          <>
                            <span>·</span>
                            <span className="text-gold/60">{shift.department.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ConfirmCompletionButton
                      shiftId={shift.id}
                      shiftTitle={shift.title}
                      workerName={shift.profile?.full_name}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Shift Claims */}
          {pendingClaims.length > 0 && (
            <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-white">Shift Claims</h2>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Workers Picked Up Shifts</p>
                </div>
              </div>
              <div className="space-y-3">
                {pendingClaims.map((shift: any) => (
                  <div key={shift.id} className="flex flex-col gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <div>
                      <p className="text-sm font-bold text-white truncate">{shift.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {shift.profile?.full_name && <span>{shift.profile.full_name}</span>}
                        {shift.department && (
                          <>
                            <span>·</span>
                            <span className="text-gold/60">{shift.department.name}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-white/30 uppercase mt-1">
                        {formatShiftDate(shift.start_time)}
                      </p>
                    </div>
                    <ApproveClaimButton
                      shiftId={shift.id}
                      shiftTitle={shift.title}
                      workerName={shift.profile?.full_name}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Swap Approvals */}
          <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-1">Swap Approvals</h2>
                <p className="text-[10px] md:text-[11px] text-white/30 font-bold uppercase tracking-widest">Pending Approvals</p>
              </div>
              {pendingSwaps.length > 0 && (
                <Link href="/swaps?status=worker_accepted" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              {pendingSwaps.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-6 md:p-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <h3 className="font-bold text-xs md:text-sm mb-1 uppercase tracking-widest">Clear Queue</h3>
                  <p className="text-[10px] md:text-xs font-medium">All swaps have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {(pendingSwaps as any[]).map((swap) => (
                    <div key={swap.id} className="group relative scroll-item">
                      <div className="flex flex-col gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-gold/20 transition-[border-color,background-color,box-shadow]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-[9px] md:text-[10px] font-black border border-gold/10">
                              {swap.requester?.full_name?.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <p className="text-xs md:text-sm font-bold truncate leading-tight">{swap.requester?.full_name}</p>
                              <p className="text-[9px] text-white/30 font-bold uppercase">Requester</p>
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-white/20 shrink-0 mx-1" />
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="flex flex-col items-end min-w-0 text-right">
                              <p className="text-xs md:text-sm font-bold truncate leading-tight">{swap.covering_worker?.full_name}</p>
                              <p className="text-[9px] text-white/30 font-bold uppercase">Cover</p>
                            </div>
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 text-[9px] md:text-[10px] font-black">
                              {swap.covering_worker?.full_name?.charAt(0) ?? "?"}
                            </div>
                          </div>
                        </div>

                        <div className="h-[1px] w-full bg-white/5" />

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            <Calendar className="w-3 h-3" />
                            {swap.shift ? `${formatShiftDate(swap.shift.start_time)} · ${formatShiftTime(swap.shift.start_time, swap.shift.end_time)}` : "No shift data"}
                          </div>
                          {swap.reason && (
                            <p className="text-[11px] md:text-xs text-white/50 italic bg-white/[0.03] p-2 md:p-3 rounded-xl border border-white/5 group-hover:bg-white/[0.05] transition-colors">
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
                    <Button variant="ghost" className="w-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-gold" asChild>
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
