import { createClient } from "@/lib/supabase/server";
import { getCachedSession } from "@/lib/supabase/cached";
import { redirect } from "next/navigation";
import { calculateBasicAnalytics, calculateAdvancedAnalytics, calculateEnterpriseAnalytics } from "@/lib/advanced-analytics";
import { checkPlanLimit } from "@/lib/plans";
import { DepartmentPerformance } from "@/components/analytics/DepartmentPerformance";
import { WorkerPerformance } from "@/components/analytics/WorkerPerformance";
import { EnterpriseMetrics } from "@/components/analytics/EnterpriseMetrics";
import { AnalyticsTable } from "@/components/analytics/AnalyticsTable";
import { ExportReportDropdown } from "@/components/dashboard/ExportReportDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { user, profile } = await getCachedSession();
  if (!user) redirect("/login");

  const orgId = profile?.organization_id;
  if (!orgId) redirect("/onboarding/industry");

  const supabase = await createClient();
  const org = (profile as any)?.organization;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: swapsData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(start_time, end_time, department_id)")
    .eq("organization_id", orgId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  const swaps = (swapsData ?? []) as any[];

  const hasAdvancedAnalytics = checkPlanLimit(org?.plan, "hasAdvancedAnalytics");
  const hasEnterpriseAnalytics = checkPlanLimit(org?.plan, "hasEnterpriseAnalytics");

  const analytics = hasEnterpriseAnalytics
    ? calculateEnterpriseAnalytics(swaps, {}, [])
    : hasAdvancedAnalytics
    ? calculateAdvancedAnalytics(swaps, {})
    : calculateBasicAnalytics(swaps);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 px-1 md:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Analytics</h1>
            <p className="text-white/40 text-[10px] md:text-sm font-medium tracking-wide uppercase">
              30-Day Performance Report
            </p>
          </div>
        </div>
        <ExportReportDropdown data={{ metrics: analytics, swaps, orgName: org?.name ?? "Organization" }} />
      </div>

      {/* Basic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Total Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{analytics.totalSwaps}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-emerald-400">{analytics.fulfillmentRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Active Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-orange-400">{analytics.activeSwaps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      {hasAdvancedAnalytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black">Advanced Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-blue-400">
                  ${((analytics as any).costSavings || 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-white/40 mt-2">vs. overtime & agency fees</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Manager Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-purple-400">
                  {((analytics as any).managerHoursSaved || 0).toFixed(1)}h
                </p>
                <p className="text-[10px] text-white/40 mt-2">manual coordination hours</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Overtime Avoided</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-yellow-400">
                  {((analytics as any).overtimeAvoided || 0).toFixed(1)}h
                </p>
                <p className="text-[10px] text-white/40 mt-2">shift hours covered</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Cancellation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-red-400">
                  {((analytics as any).cancellationRate || 0)}%
                </p>
                <p className="text-[10px] text-white/40 mt-2">of swap requests</p>
              </CardContent>
            </Card>
          </div>

          {/* Worker Performance */}
          <WorkerPerformance workers={(analytics as any).topWorkers || []} />

          {/* Worker Performance Table */}
          <AnalyticsTable
            title="Top Workers - Detailed View"
            description="Workers with the most swap coverage"
            columns={[
              { key: "name", label: "Worker Name" },
              { key: "swaps", label: "Swaps Covered", format: (v) => v.toString() },
              { key: "percentage", label: "% of Total", format: (v) => v ? `${v.toFixed(1)}%` : "0%" },
            ]}
            data={((analytics as any).topWorkers || []).map((w: any) => ({
              ...w,
              percentage: swaps.length > 0 ? (w.swaps / swaps.length) * 100 : 0,
            }))}
          />
        </div>
      )}

      {/* Enterprise Analytics */}
      {hasEnterpriseAnalytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black">Enterprise Insights</h2>

          <EnterpriseMetrics
            workerEngagementScore={(analytics as any).workerEngagementScore || 0}
            shiftCoverageRate={(analytics as any).shiftCoverageRate || 0}
            predictedBusyTimes={(analytics as any).predictedBusyTimes || []}
            overtimeAvoided={(analytics as any).overtimeAvoided || 0}
            cancellationRate={(analytics as any).cancellationRate || 0}
            avgFulfillmentTime={(analytics as any).avgFulfillmentTime || null}
          />

          {/* Department Performance */}
          <DepartmentPerformance departments={(analytics as any).departmentPerformance || []} />

          {/* Department Performance Table */}
          <AnalyticsTable
            title="Department Performance - Detailed"
            description="Performance metrics by department"
            columns={[
              { key: "name", label: "Department" },
              { key: "fulfillmentRate", label: "Fulfillment Rate", format: (v) => `${v}%` },
              { key: "avgTime", label: "Avg Fulfillment (hrs)", format: (v) => v.toFixed(1) },
              { key: "activeSwaps", label: "Active Swaps", format: (v) => v.toString() },
            ]}
            data={(analytics as any).departmentPerformance || []}
          />
        </div>
      )}

      {/* Locked Features */}
      {!hasAdvancedAnalytics && (
        <div className="glass rounded-2xl p-8 border-gold/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -z-10" />
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-black text-white mb-2">Unlock Advanced Analytics</h3>
              <p className="text-white/60 mb-4">
                Upgrade to Growth plan to access cost savings tracking, worker performance metrics, and more detailed insights.
              </p>
              <Link
                href="/settings?tab=billing"
                className="inline-block px-6 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-lg font-bold text-gold transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
