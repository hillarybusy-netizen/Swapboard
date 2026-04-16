import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { calculateROI, groupSwapsByWeek } from "@/lib/analytics";
import { getTrialStatus } from "@/lib/trial";
import { formatCurrency, formatShiftDate, formatShiftTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  TrendingUp, DollarSign, Clock, RefreshCw, ArrowRight, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { SwapChart } from "@/components/dashboard/SwapChart";
import { ApproveSwapButton } from "@/components/dashboard/ApproveSwapButton";

export const dynamic = "force-dynamic";

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

  // Fetch swap data (last 30 days)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data: swapsData } = await supabase
    .from("swap_requests")
    .select("*")
    .eq("organization_id", profile?.organization_id ?? "")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  // Pending swaps (need manager approval)
  const { data: pendingSwapsData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(*, department:departments(*)), requester:profiles!swap_requests_requester_id_fkey(*), covering_worker:profiles!swap_requests_covering_worker_id_fkey(*)")
    .eq("organization_id", profile?.organization_id ?? "")
    .eq("status", "worker_accepted")
    .order("requested_at", { ascending: false })
    .limit(5);

  // At-risk shifts (open or swap_pending within 48h)
  const in48h = new Date();
  in48h.setHours(in48h.getHours() + 48);
  const { data: atRiskShiftsData } = await supabase
    .from("shifts")
    .select("*, department:departments(*), profile:profiles!shifts_assigned_to_fkey(*)")
    .eq("organization_id", profile?.organization_id ?? "")
    .in("status", ["open", "swap_pending"])
    .lte("start_time", in48h.toISOString())
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Last 30 days · {org?.name}</p>
      </div>

      {/* Trial progress */}
      {trialStatus.isOnTrial && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900">
                  Free Trial — {trialStatus.daysRemaining} days remaining
                </p>
                <Progress value={trialStatus.percentUsed} className="mt-2 h-2 bg-amber-200 [&>div]:bg-amber-500" />
              </div>
              <Button size="sm" asChild>
                <Link href="/settings?tab=billing">Upgrade plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{kpi.sub}</p>
              <p className="text-sm font-medium mt-2">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts + Pending side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Swap Activity (4 weeks)</CardTitle>
            <CardDescription>Requested vs. fulfilled by week</CardDescription>
          </CardHeader>
          <CardContent>
            <SwapChart data={weeklyData} />
          </CardContent>
        </Card>

        {/* Pending approvals */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <CardDescription>Waiting for your review</CardDescription>
            </div>
            {pendingSwaps.length > 0 && (
              <Link href="/swaps?status=worker_accepted" className="text-sm text-primary hover:underline">
                View all <ArrowRight className="inline w-3 h-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {pendingSwaps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(pendingSwaps as any[]).map((swap) => (
                  <div key={swap.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {swap.requester?.full_name ?? "Unknown"} → {swap.covering_worker?.full_name ?? "Pending"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {swap.shift ? `${formatShiftDate(swap.shift.start_time)} · ${formatShiftTime(swap.shift.start_time, swap.shift.end_time)}` : ""}
                      </p>
                      {swap.reason && <p className="text-xs text-muted-foreground mt-0.5 italic">"{swap.reason}"</p>}
                    </div>
                    <ApproveSwapButton swapId={swap.id} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* At-risk shifts */}
      {atRiskShifts.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <CardTitle className="text-base">At-Risk Shifts (next 48h)</CardTitle>
            </div>
            <CardDescription>Open or swap-pending shifts starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(atRiskShifts as any[]).map((shift) => (
                <div key={shift.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div>
                    <p className="text-sm font-medium">{shift.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatShiftDate(shift.start_time)} · {formatShiftTime(shift.start_time, shift.end_time)}
                      {shift.department && ` · ${shift.department.name}`}
                    </p>
                  </div>
                  <Badge variant="warning">{shift.status === "open" ? "Open" : "Swap Pending"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
