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

  const now = new Date();
  const since = new Date(now);
  since.setDate(now.getDate() - 30);

  const [
    { data: swapsData },
    { data: departmentsData },
    { data: managersData }
  ] = await Promise.all([
    supabase
      .from("swap_requests")
      .select("*, shift:shifts(start_time, end_time, department_id), covering_worker:profiles!covering_worker_id(id, full_name), manager:profiles!approved_by(id, full_name)")
      .eq("organization_id", orgId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("departments")
      .select("id, name")
      .eq("organization_id", orgId),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("organization_id", orgId)
      .in("user_role", ["org_admin", "manager"])
  ]);

  const swaps = (swapsData ?? []) as any[];
  const departments = (departmentsData ?? []) as any[];
  const managers = (managersData ?? []) as any[];

  const hasAdvancedAnalytics = checkPlanLimit(org?.plan, "hasAdvancedAnalytics");
  const hasEnterpriseAnalytics = checkPlanLimit(org?.plan, "hasEnterpriseAnalytics");

  // Build profiles map from managers and extract workers from swap relations
  const profilesMap: Record<string, any> = {};
  managers.forEach(m => {
    profilesMap[m.id] = m;
  });
  swaps.forEach(swap => {
    if (swap.covering_worker) {
      profilesMap[swap.covering_worker.id] = swap.covering_worker;
    }
    if (swap.manager) {
      profilesMap[swap.manager.id] = swap.manager;
    }
  });

  const analytics = hasEnterpriseAnalytics
    ? calculateEnterpriseAnalytics(swaps, profilesMap, departments, managers)
    : hasAdvancedAnalytics
    ? calculateAdvancedAnalytics(swaps, profilesMap, departments)
    : calculateBasicAnalytics(swaps);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 px-1 md:px-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Analytics</h1>
            <p className="text-white/55 text-[11px] md:text-sm font-medium tracking-wide uppercase">
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
            <p className="text-4xl font-semibold">{analytics.totalSwaps}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-emerald-400">{analytics.fulfillmentRate}%</p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">Active Swaps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-orange-400">{analytics.activeSwaps}</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      {hasAdvancedAnalytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Advanced Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-blue-400">
                  ${((analytics as any).costSavings || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-white/55 mt-2">vs. overtime & agency fees</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Manager Time Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-purple-400">
                  {((analytics as any).managerHoursSaved || 0).toFixed(1)}h
                </p>
                <p className="text-[11px] text-white/55 mt-2">manual coordination hours</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Overtime Avoided</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-yellow-400">
                  {((analytics as any).overtimeAvoided || 0).toFixed(1)}h
                </p>
                <p className="text-[11px] text-white/55 mt-2">shift hours covered</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardHeader>
                <CardTitle className="text-base font-bold">Cancellation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-red-400">
                  {((analytics as any).cancellationRate || 0)}%
                </p>
                <p className="text-[11px] text-white/55 mt-2">of swap requests</p>
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
              { key: "swaps", label: "Swaps Covered" },
              { key: "percentage", label: "% of Total" },
            ]}
            data={((analytics as any).topWorkers || []).map((w: any) => ({
              name: w.name,
              swaps: w.swaps.toString(),
              percentage: swaps.length > 0 ? `${((w.swaps / swaps.length) * 100).toFixed(1)}%` : "0%",
            }))}
          />
        </div>
      )}

      {/* Enterprise Analytics */}
      {hasEnterpriseAnalytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Enterprise Insights</h2>

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
              { key: "fulfillmentRate", label: "Fulfillment Rate" },
              { key: "avgTime", label: "Avg Fulfillment (hrs)" },
              { key: "activeSwaps", label: "Active Swaps" },
            ]}
            data={((analytics as any).departmentPerformance || []).map((d: any) => ({
              name: d.name,
              fulfillmentRate: `${d.fulfillmentRate}%`,
              avgTime: d.avgTime.toFixed(1),
              activeSwaps: d.activeSwaps.toString(),
            }))}
          />
        </div>
      )}

      {/* Locked Features */}
      {!hasAdvancedAnalytics && (
        <div className="glass rounded-2xl p-5 sm:p-8 border-gold/20 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Unlock Advanced Analytics</h3>
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
