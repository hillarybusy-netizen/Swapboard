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
import Link from "next/link";
import {
  TrendingUp, DollarSign, Clock, RefreshCw, ArrowRight, CheckCircle2, XCircle,
  AlertTriangle, Calendar, UserPlus, Users, Briefcase, ShieldCheck,
} from "lucide-react";
import { ApproveSwapButton } from "@/components/dashboard/ApproveSwapButton";
import { ApproveClaimButton } from "@/components/shifts/ApproveClaimButton";
import { SwapChartLazy } from "@/components/dashboard/SwapChartLazy";
import { Lock } from "lucide-react";
import { ExportReportDropdown } from "@/components/dashboard/ExportReportDropdown";
import { AddShiftDialog } from "@/components/shifts/AddShiftDialog";
import { ConfirmCompletionButton } from "@/components/shifts/ConfirmCompletionButton";
import { checkPlanLimit } from "@/lib/plans";
import { calculateBasicAnalytics, calculateAdvancedAnalytics, calculateEnterpriseAnalytics } from "@/lib/advanced-analytics";
import { DepartmentPerformance } from "@/components/analytics/DepartmentPerformance";
import { WorkerPerformance } from "@/components/analytics/WorkerPerformance";
import { EnterpriseMetrics } from "@/components/analytics/EnterpriseMetrics";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const { user, profile } = await getCachedSession();
  const supabase = await createClient();
  const org = (profile as any)?.organization;
  const orgId = profile?.organization_id ?? "";
  const tz = profile?.timezone || "UTC";

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // --- Fetch all data (admins see everything — no department scoping) ---
  const [
    { data: swapsData },
    { data: pendingSwapsData },
    { data: pendingInvitesData },
    { data: atRiskShiftsData },
    { data: departmentsData },
    { data: profilesData },
    { data: pendingCompletionsData },
    { data: pendingClaimsData },
    { count: memberCount },
    { count: departmentCount },
  ] = await Promise.all([
    // All swaps (last 30 days)
    supabase
      .from("swap_requests")
      .select(`
        *,
        shift:shifts(start_time, end_time, department_id),
        covering_worker:profiles!covering_worker_id(id, full_name),
        manager:profiles!approved_by(id, full_name)
      `)
      .eq("organization_id", orgId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false }),

    // Pending swaps (need approval)
    supabase
      .from("swap_requests")
      .select(`
        *,
        shift:shifts!swap_requests_shift_id_fkey(id, start_time, end_time, title, department_id),
        requester:profiles!requester_id(id, full_name),
        covering_worker:profiles!covering_worker_id(id, full_name)
      `)
      .eq("organization_id", orgId)
      .in("status", ["pending", "worker_accepted"])
      .order("created_at", { ascending: false })
      .limit(5),

    // Pending invitations (admin visibility only)
    supabase
      .from("invitations")
      .select("id, email, user_role, created_at")
      .eq("organization_id", orgId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false })
      .limit(6),

    // At-risk shifts (within 48h)
    supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(*)")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .in("status", ["not_started", "up_for_swap", "pending_approval_swap"])
      .lte("start_time", in48h.toISOString())
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(5),

    // Departments
    supabase
      .from("departments")
      .select("*")
      .eq("organization_id", orgId)
      .order("name"),

    // Worker profiles
    supabase
      .from("profiles")
      .select("id, full_name, department_id, department_ids, user_role")
      .eq("organization_id", orgId)
      .eq("is_active", true)
      .order("full_name"),

    // Shifts awaiting completion confirmation
    supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(full_name)")
      .eq("organization_id", orgId)
      .eq("status", "done_pending_approval")
      .is("deleted_at", null)
      .order("end_time", { ascending: false })
      .limit(5),

    // Shifts awaiting claim approval
    supabase
      .from("shifts")
      .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(full_name)")
      .eq("organization_id", orgId)
      .eq("status", "pending_approval_claim")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),

    // Member count (admin-only stat)
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .eq("is_active", true),

    // Department count (admin-only stat)
    supabase
      .from("departments")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
  ]);

  const swaps = (swapsData ?? []) as any[];
  const pendingSwaps = (pendingSwapsData ?? []) as any[];
  const pendingInvites = (pendingInvitesData ?? []) as any[];
  const atRiskShifts = (atRiskShiftsData ?? []) as any[];
  const departments = (departmentsData ?? []) as any[];
  const profiles = (profilesData ?? []) as any[];
  const pendingCompletions = (pendingCompletionsData ?? []) as any[];
  const pendingClaims = (pendingClaimsData ?? []) as any[];

  const workerProfiles = profiles.filter((p) => p.user_role === "worker");

  // Analytics
  const hasAdvancedAnalytics = checkPlanLimit(org?.plan, "hasAdvancedAnalytics");
  const hasEnterpriseAnalytics = checkPlanLimit(org?.plan, "hasEnterpriseAnalytics");

  const profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const managersData = profiles.filter((p) => p.user_role === "manager" || p.user_role === "org_admin");

  const analytics = hasEnterpriseAnalytics
    ? calculateEnterpriseAnalytics(swaps, profilesMap, departments, managersData)
    : hasAdvancedAnalytics
    ? calculateAdvancedAnalytics(swaps, profilesMap, departments)
    : calculateBasicAnalytics(swaps);

  const metrics = analytics;
  const weeklyData = groupSwapsByWeek(swaps as any);
  const trialStatus = getTrialStatus(org);

  // KPI cards — same as manager but no department scoping
  const kpis = [
    {
      title: "Swap Fulfillment Rate",
      value: `${metrics.fulfillmentRate}%`,
      sub: `${swaps.filter((s) => s.status === "manager_approved").length} of ${metrics.totalSwaps} requests fulfilled`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      locked: false,
    },
    ...(hasAdvancedAnalytics
      ? [
          {
            title: "Cost Savings",
            value: formatCurrency((metrics as any).costSavings || 0),
            sub: "vs. overtime & agency fees (30 days)",
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-blue-50",
            locked: false,
          },
          {
            title: "Manager Time Saved",
            value: `${((metrics as any).managerHoursSaved || 0).toFixed(1)}h`,
            sub: "vs. manual phone coordination",
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-50",
            locked: false,
          },
        ]
      : [
          {
            title: "Cost Savings",
            value: "—",
            sub: "Upgrade to Growth plan to unlock",
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-blue-50",
            locked: true,
          },
          {
            title: "Manager Time Saved",
            value: "—",
            sub: "Upgrade to Growth plan to unlock",
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-50",
            locked: true,
          },
        ]),
    {
      title: "Active Swaps",
      value: metrics.activeSwaps.toString(),
      sub: "in progress right now",
      icon: RefreshCw,
      color: "text-orange-600",
      bg: "bg-orange-50",
      locked: false,
    },
  ];

  // Admin-exclusive stat cards
  const adminStats = [
    {
      label: "Team Members",
      value: memberCount ?? 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Departments",
      value: departmentCount ?? 0,
      icon: Briefcase,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-wide uppercase">
            30-Day Performance Overview ·{" "}
            <span className="text-gold/60">{org?.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportReportDropdown data={{ metrics, swaps, orgName: org?.name ?? "Organization" }} />
          <AddShiftDialog orgId={orgId} departments={departments} profiles={workerProfiles} timezone={tz} />
        </div>
      </div>

      {/* Admin-exclusive org stats */}
      <div className="grid grid-cols-2 gap-4 px-1 md:px-2">
        {adminStats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border-white/5 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl -z-10`} />
            <div className="mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
              {stat.label}
            </p>
            <h2 className="text-3xl font-black text-white">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Trial Banner */}
      {trialStatus.isOnTrial && (
        <div className="mx-1 md:mx-2">
          <div className="glass rounded-[1.5rem] md:rounded-[2rem] border-gold/20 p-5 md:p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10 group-hover:bg-gold/10 transition-colors duration-500" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gold text-glow-gold">
                    Trial Status
                  </span>
                  <span className="text-[10px] md:text-xs font-bold text-white/40">
                    {trialStatus.daysRemaining} days left
                  </span>
                </div>
                <Progress
                  value={trialStatus.percentUsed}
                  className="h-2 md:h-2.5 bg-white/5 [&>div]:bg-gold shadow-inner"
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                <p className="text-sm font-medium text-white/60 hidden lg:block">
                  Enjoying SwapBoard? Upgrade now for unlimited features.
                </p>
                <Button
                  size="lg"
                  className="btn-gold rounded-full px-8 text-xs font-black uppercase tracking-widest w-full md:w-auto h-12 md:h-auto"
                  asChild
                >
                  <Link href="/admin/settings?tab=billing">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-1 md:px-2">
        {kpis.map((kpi: any) => (
          <div
            key={kpi.title}
            className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] relative overflow-hidden group"
          >
            {kpi.locked && (
              <div className="absolute inset-0 z-20 bg-[#050505]/40 backdrop-blur-sm flex items-center justify-center">
                <Lock className="w-5 h-5 text-gold/60" />
              </div>
            )}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] blur-2xl group-hover:bg-gold/[0.05] transition-colors" />
            <div className="mb-4 md:mb-6">
              <kpi.icon className={`w-6 h-6 md:w-7 md:h-7 ${kpi.color}`} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30">
                {kpi.title}
              </h3>
              <p className="text-3xl md:text-4xl font-black text-white tabular-nums tracking-tighter">
                {kpi.value}
              </p>
              <p className="text-[10px] md:text-[11px] text-white/40 font-medium leading-relaxed mt-1 md:mt-2">
                {kpi.sub}
              </p>
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
                <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                  ROI Analytics Locked
                </h3>
                <p className="text-sm text-white/50 max-w-xs mb-6 font-medium leading-relaxed">
                  Upgrade to the Growth plan to unlock historical trends and deep cost-saving insights.
                </p>
                <Button className="btn-gold rounded-full px-8" asChild>
                  <Link href="/admin/settings?tab=billing">View Plans</Link>
                </Button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-1">
                  Swap Activity
                </h2>
                <p className="text-[10px] md:text-[11px] text-white/30 font-bold uppercase tracking-widest">
                  Fulfillment Trends · 4 Weeks
                </p>
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
                    <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-1">
                      Critical Shifts
                    </h2>
                    <p className="text-[10px] md:text-[11px] text-red-500/60 font-bold uppercase tracking-widest">
                      Required Action Within 48h
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {(atRiskShifts as any[]).map((shift) => (
                  <div
                    key={shift.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group scroll-item"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-white mb-1">{shift.title}</p>
                      <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-white/40 font-medium">
                        <span>{formatShiftDate(shift.start_time, tz)}</span>
                        <span>·</span>
                        <span>{formatShiftTime(shift.start_time, shift.end_time, tz)}</span>
                        {shift.department && (
                          <>
                            <span className="hidden sm:inline">·</span>
                            <span className="text-gold/60">{shift.department.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "rounded-full px-4 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest border-none w-fit",
                        shift.status === "not_started"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gold/20 text-gold"
                      )}
                    >
                      {shift.status === "not_started" ? "Unassigned" : "Swap Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
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
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    Awaiting Your Confirmation
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {pendingCompletions.map((shift: any) => (
                  <div
                    key={shift.id}
                    className="flex flex-col gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
                  >
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <UserPlus className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight text-white">Shift Claims</h2>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      Awaiting Your Approval
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/claims"
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {pendingClaims.map((shift: any) => (
                  <div
                    key={shift.id}
                    className="flex flex-col gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10"
                  >
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
                        {formatShiftDate(shift.start_time, tz)}
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

          {/* Pending Invitations (admin only) */}
          {pendingInvites.length > 0 && (
            <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-black tracking-tight text-white">Pending Invitations</h2>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    Awaiting Team Acceptance
                  </p>
                </div>
                <Link
                  href="/team"
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {pendingInvites.map((invite: any) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {invite.email ?? "Manual link invite"}
                      </p>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                        {invite.user_role} · {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Swap Approvals */}
          <div className="card-premium p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <h2 className="text-lg md:text-xl font-black tracking-tight text-white mb-1">
                  Swap Approvals
                </h2>
                <p className="text-[10px] md:text-[11px] text-white/30 font-bold uppercase tracking-widest">
                  Pending Approvals
                </p>
              </div>
              {pendingSwaps.length > 0 && (
                <Link
                  href="/swaps?status=worker_accepted"
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-all"
                >
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
                              <p className="text-xs md:text-sm font-bold truncate leading-tight">
                                {swap.requester?.full_name}
                              </p>
                              <p className="text-[9px] text-white/30 font-bold uppercase">Requester</p>
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-white/20 shrink-0 mx-1" />
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div className="flex flex-col items-end min-w-0 text-right">
                              <p className="text-xs md:text-sm font-bold truncate leading-tight">
                                {swap.covering_worker?.full_name}
                              </p>
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
                            {swap.shift
                              ? `${formatShiftDate(swap.shift.start_time, tz)} · ${formatShiftTime(swap.shift.start_time, swap.shift.end_time, tz)}`
                              : "No shift data"}
                          </div>
                          {swap.reason && (
                            <p className="text-[11px] md:text-xs text-white/50 italic bg-white/[0.03] p-2 md:p-3 rounded-xl border border-white/5">
                              "{swap.reason}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2">
                          <ApproveSwapButton swapId={swap.id} hasCoverage={swap.status === "worker_accepted"} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {pendingSwaps.length >= 5 && (
                    <Button
                      variant="ghost"
                      className="w-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-gold"
                      asChild
                    >
                      <Link href="/swaps?status=worker_accepted">View All Pending Requests</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      {hasAdvancedAnalytics && (
        <div className="space-y-8 px-1 md:px-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Advanced Analytics
            </h2>
            <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-wide uppercase">
              Detailed insights into your swap operations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-1">
              <WorkerPerformance workers={(analytics as any).topWorkers || []} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-premium p-6 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                    Overtime Avoided
                  </div>
                  <p className="text-4xl font-black text-yellow-400 mb-2">
                    {((analytics as any).overtimeAvoided || 0).toFixed(1)}h
                  </p>
                  <p className="text-[10px] text-white/40">shift hours covered by swaps</p>
                </div>
                <div className="card-premium p-6 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                    Cancellation Rate
                  </div>
                  <p className="text-4xl font-black text-red-400 mb-2">
                    {((analytics as any).cancellationRate || 0)}%
                  </p>
                  <p className="text-[10px] text-white/40">of swap requests cancelled</p>
                </div>
                {(analytics as any).avgFulfillmentTime !== null && (
                  <div className="card-premium p-6 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                      Avg Fulfillment Time
                    </div>
                    <p className="text-4xl font-black text-purple-400 mb-2">
                      {((analytics as any).avgFulfillmentTime || 0).toFixed(1)}h
                    </p>
                    <p className="text-[10px] text-white/40">to approve swap requests</p>
                  </div>
                )}
                <div className="card-premium p-6 rounded-2xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                    Swaps by Department
                  </div>
                  <div className="space-y-2">
                    {Object.entries((analytics as any).swapsByDepartment || {})
                      .slice(0, 3)
                      .map(([deptName, count]: any) => (
                        <div key={deptName} className="flex justify-between text-sm">
                          <span className="text-white/60 truncate">{deptName}</span>
                          <span className="font-bold text-gold">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enterprise Analytics Section */}
      {hasEnterpriseAnalytics && (
        <div className="space-y-8 px-1 md:px-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Enterprise Insights
            </h2>
            <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-wide uppercase">
              Advanced analytics and performance metrics
            </p>
          </div>

          <EnterpriseMetrics
            workerEngagementScore={(analytics as any).workerEngagementScore || 0}
            shiftCoverageRate={(analytics as any).shiftCoverageRate || 0}
            predictedBusyTimes={(analytics as any).predictedBusyTimes || []}
            overtimeAvoided={(analytics as any).overtimeAvoided || 0}
            cancellationRate={(analytics as any).cancellationRate || 0}
            avgFulfillmentTime={(analytics as any).avgFulfillmentTime || null}
          />

          {((analytics as any).departmentPerformance || []).length > 0 && (
            <DepartmentPerformance departments={(analytics as any).departmentPerformance || []} />
          )}

          {((analytics as any).managerWorkload || []).length > 0 && (
            <div className="card-premium p-6 md:p-8 rounded-2xl md:rounded-3xl">
              <h3 className="text-lg font-black mb-6">Manager Workload</h3>
              <div className="space-y-3">
                {((analytics as any).managerWorkload || []).slice(0, 5).map((manager: any) => (
                  <div
                    key={manager.managerId}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <span className="text-sm font-bold text-white/80">
                      {manager.name || `Manager ${manager.managerId.slice(0, 8)}`}
                    </span>
                    <span className="text-lg font-black text-gold">{manager.swaps}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys((analytics as any).swapReasons || {}).length > 0 && (
            <div className="card-premium p-6 md:p-8 rounded-2xl md:rounded-3xl">
              <h3 className="text-lg font-black mb-6">Top Swap Reasons</h3>
              <div className="space-y-2">
                {Object.entries((analytics as any).swapReasons || {})
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 5)
                  .map(([reason, count]: any) => (
                    <div key={reason} className="flex items-center justify-between text-sm p-2">
                      <span className="text-white/70 truncate">{reason}</span>
                      <span className="text-gold font-bold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Prompt for Basic Plan */}
      {!hasAdvancedAnalytics && (
        <div className="glass rounded-2xl p-8 border-gold/20 mx-1 md:mx-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10" />
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-black text-white mb-2">Unlock Advanced Analytics</h3>
              <p className="text-white/60 mb-4">
                Upgrade to Growth plan to access detailed performance metrics, worker analytics, cancellation rates, and more.
              </p>
              <Link
                href="/analytics"
                className="inline-block px-6 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg font-bold text-gold transition-colors text-sm"
              >
                View Full Analytics
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
