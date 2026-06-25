import { createClient } from "@/lib/supabase/server";
import { getOrganizations } from "@/lib/actions/admin";
import { calculateBasicAnalytics, calculateAdvancedAnalytics, calculateEnterpriseAnalytics } from "@/lib/advanced-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Activity, Clock, DollarSign, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import AnalyticsCharts from "@/components/admin/AnalyticsChartsClient";
import { TrendChart } from "@/components/analytics/TrendChart";
import { PieChartComponent } from "@/components/analytics/PieChartComponent";
import { BarChartComponent } from "@/components/analytics/BarChartComponent";
import { HeatmapComponent } from "@/components/analytics/HeatmapComponent";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const orgs = await getOrganizations();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const since90d = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Get all swaps across all organizations
  const [
    { data: swapsData },
    { data: swaps7dData },
    { data: swaps90dData },
    { data: profilesData },
    { data: departmentsData },
    { data: shiftsData },
  ] = await Promise.all([
    supabase
      .from("swap_requests")
      .select("*, shift:shifts(start_time, end_time, department_id), covering_worker:profiles!covering_worker_id(id, full_name), manager:profiles!approved_by_fkey(id, full_name)")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("swap_requests")
      .select("*")
      .gte("created_at", since7d.toISOString())
      .order("created_at", { ascending: false }),
    supabase
      .from("swap_requests")
      .select("*")
      .gte("created_at", since90d.toISOString())
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, organization_id, user_role"),
    supabase.from("departments").select("id, name, organization_id"),
    supabase.from("shifts").select("id, status, start_time, organization_id"),
  ]);

  const swaps = (swapsData ?? []) as any[];
  const swaps7d = (swaps7dData ?? []) as any[];
  const swaps90d = (swaps90dData ?? []) as any[];
  const profiles = (profilesData ?? []) as any[];
  const departments = (departmentsData ?? []) as any[];
  const shifts = (shiftsData ?? []) as any[];

  // Build lookup maps
  const profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
  const managersData = profiles.filter((p) => p.user_role === "manager" || p.user_role === "admin");

  // Calculate aggregate analytics
  const analytics = calculateBasicAnalytics(swaps);
  const analytics30d = calculateAdvancedAnalytics(swaps, profilesMap, departments);
  const analytics90d = calculateAdvancedAnalytics(swaps90d, profilesMap, departments);

  // Calculate per-organization stats
  const orgStats = orgs
    .map((org: any) => {
      const orgSwaps = swaps.filter((s: any) => s.organization_id === org.id);
      const orgSwaps7d = swaps7d.filter((s: any) => s.organization_id === org.id);
      const orgAnalytics = calculateAdvancedAnalytics(orgSwaps, profilesMap, departments);
      return {
        name: org.name,
        totalSwaps: orgAnalytics.totalSwaps,
        fulfillmentRate: orgAnalytics.fulfillmentRate,
        activeSwaps: orgAnalytics.activeSwaps,
        costSavings: orgAnalytics.costSavings,
        managerHoursSaved: orgAnalytics.managerHoursSaved,
        plan: org.plan,
        swaps7d: orgSwaps7d.length,
        industry: org.industry,
      };
    })
    .filter((org: any) => org.totalSwaps > 0)
    .sort((a: any, b: any) => b.totalSwaps - a.totalSwaps);

  // Prepare data for charts
  const planDistribution = [
    { name: "Trial", value: orgs.filter((o: any) => o.plan === "trial").length },
    { name: "Starter", value: orgs.filter((o: any) => o.plan === "starter").length },
    { name: "Growth", value: orgs.filter((o: any) => o.plan === "growth").length },
    { name: "Enterprise", value: orgs.filter((o: any) => o.plan === "enterprise").length },
  ].filter((item) => item.value > 0);

  // Industry distribution
  const industryDistribution = Object.entries(
    orgs.reduce((acc: any, org: any) => {
      const industry = org.industry || "unknown";
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value);

  // Daily trend data (last 30 days)
  const dailyData: Record<string, any> = {};
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dailyData[dateStr] = {
      date: dateStr,
      requested: 0,
      fulfilled: 0,
      cancelled: 0,
      pending: 0,
    };
  }

  swaps.forEach((swap) => {
    const dateStr = new Date(swap.created_at).toISOString().split("T")[0];
    if (dailyData[dateStr]) {
      if (swap.status === "manager_approved") dailyData[dateStr].fulfilled++;
      else if (swap.status === "cancelled") dailyData[dateStr].cancelled++;
      else if (swap.status === "pending" || swap.status === "worker_accepted") dailyData[dateStr].pending++;
      dailyData[dateStr].requested++;
    }
  });

  const trendData = Object.values(dailyData);

  // Hourly heatmap data
  const heatmapData: any[] = [];
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  daysOfWeek.forEach((day, dayIdx) => {
    for (let hour = 0; hour < 24; hour++) {
      let count = 0;
      swaps.forEach((swap) => {
        const date = new Date(swap.shift?.start_time || swap.created_at);
        if (date.getDay() === (dayIdx + 1) % 7 && date.getHours() === hour) {
          count++;
        }
      });
      heatmapData.push({ day, hour, value: count });
    }
  });

  // Top workers across all orgs
  const workerStats: Record<string, any> = {};
  swaps.forEach((swap) => {
    if (swap.covering_worker) {
      const workerId = swap.covering_worker.id;
      if (!workerStats[workerId]) {
        workerStats[workerId] = {
          name: swap.covering_worker.full_name || "Unknown",
          swaps: 0,
          organization: swap.organization_id,
        };
      }
      workerStats[workerId].swaps++;
    }
  });

  const topWorkers = Object.values(workerStats)
    .sort((a: any, b: any) => b.swaps - a.swaps)
    .slice(0, 10)
    .map((w: any) => ({ name: w.name, value: w.swaps }));

  // Plan comparison
  const planStats = Object.entries(
    orgs.reduce((acc: any, org: any) => {
      const plan = org.plan || "unknown";
      const orgSwaps = swaps.filter((s: any) => s.organization_id === org.id).length;
      if (!acc[plan]) acc[plan] = 0;
      acc[plan] += orgSwaps;
      return acc;
    }, {})
  ).map(([plan, count]) => ({ name: plan, swaps: count as number }));

  // Status distribution
  const statusDistribution = [
    { name: "Approved", value: swaps.filter((s) => s.status === "manager_approved").length },
    { name: "Pending", value: swaps.filter((s) => s.status === "pending" || s.status === "worker_accepted").length },
    { name: "Cancelled", value: swaps.filter((s) => s.status === "cancelled").length },
    { name: "Rejected", value: swaps.filter((s) => s.status === "rejected").length },
  ].filter((item) => item.value > 0);

  // Calculate growth metrics
  const growth7d = swaps7d.length;
  const swaps90dAgo = new Date(Date.now() - 97 * 24 * 60 * 60 * 1000);
  const swapsFromWeek4 = swaps90d.filter((s) => new Date(s.created_at) < swaps90dAgo).length;

  const COLORS = ["#fbbf24", "#3b82f6", "#15aabf", "#ffd43b", "#ef4444"];

  return (
    <div className="space-y-8 max-w-full pb-10 px-2 md:px-4">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Platform Analytics</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Comprehensive 30-Day Performance Dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Total Swaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black">{analytics.totalSwaps}</p>
            <p className="text-[10px] text-white/40 mt-1">30-day total</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Avg Fulfillment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black text-emerald-400">{analytics.fulfillmentRate}%</p>
            <p className="text-[10px] text-white/40 mt-1">Success rate</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Active Right Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black text-orange-400">{analytics.activeSwaps}</p>
            <p className="text-[10px] text-white/40 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black text-purple-400">{orgs.length}</p>
            <p className="text-[10px] text-white/40 mt-1">Active customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              7-Day Swaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black text-yellow-400">{growth7d}</p>
            <p className="text-[10px] text-white/40 mt-1">Last week activity</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              Est. Cost Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black text-green-400">${(analytics30d.costSavings / 1000).toFixed(1)}K</p>
            <p className="text-[10px] text-white/40 mt-1">vs. agency & overtime</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Mgr Hours Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl lg:text-4xl font-black text-cyan-400">{analytics30d.managerHoursSaved.toFixed(1)}h</p>
            <p className="text-[10px] text-white/40 mt-1">Manual coordination avoided</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          data={trendData}
          dataKeys={[
            { key: "requested", label: "Requested", color: "#e2e8f0" },
            { key: "fulfilled", label: "Fulfilled", color: "#3b82f6" },
            { key: "cancelled", label: "Cancelled", color: "#ef4444" },
          ]}
          title="30-Day Swap Activity Trend"
          height={300}
        />

        <PieChartComponent data={planDistribution} title="Customer Distribution by Plan" />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          data={statusDistribution}
          title="Swap Status Distribution"
          colors={["#10b981", "#3b82f6", "#ef4444", "#f59e0b"]}
        />

        <BarChartComponent
          data={topWorkers.slice(0, 8).map((w) => ({ name: w.name.split(" ")[0], value: w.value }))}
          dataKeys={[{ key: "value", label: "Swaps Covered", color: "#fbbf24" }]}
          title="Top 8 Workers (All Orgs)"
          height={300}
        />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 gap-6">
        <HeatmapComponent data={heatmapData} title="Swap Activity Heatmap - By Day & Hour (30 Days)" />
      </div>

      {/* Charts Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          data={industryDistribution}
          dataKeys={[{ key: "value", label: "Organizations", color: "#8b5cf6" }]}
          title="Customer Distribution by Industry"
          height={300}
        />

        <BarChartComponent
          data={planStats}
          dataKeys={[{ key: "swaps", label: "Swaps", color: "#06b6d4" }]}
          title="Total Swaps by Plan Type"
          height={300}
        />
      </div>

      {/* Original Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsCharts planDistribution={planDistribution} orgStats={orgStats} analytics={analytics} />

        {/* Top Organizations */}
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Organizations (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {orgStats.slice(0, 8).map((org: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white truncate">{org.name}</p>
                    <p className="text-[10px] text-white/40 capitalize">{org.plan} · {org.industry}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-black text-gold">{org.totalSwaps}</p>
                    <p className="text-[10px] text-white/40">{org.fulfillmentRate}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Organization Performance Table */}
      {orgStats.length > 0 && (
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Organization Performance (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Organization</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Total</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">7-Day</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Fulfillment</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Cost Savings</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Mgr Hours</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {orgStats.map((org: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">{org.name}</td>
                      <td className="text-right py-4 px-4 text-white/80">{org.totalSwaps}</td>
                      <td className="text-right py-4 px-4 text-white/80">{org.swaps7d}</td>
                      <td className="text-right py-4 px-4">
                        <span className={org.fulfillmentRate >= 70 ? "text-emerald-400 font-bold" : "text-orange-400 font-bold"}>
                          {org.fulfillmentRate}%
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-green-400 font-bold">${(org.costSavings / 1000).toFixed(1)}K</td>
                      <td className="text-right py-4 px-4 text-cyan-400 font-bold">{org.managerHoursSaved.toFixed(1)}h</td>
                      <td className="text-right py-4 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold capitalize">
                          {org.plan}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Card */}
      <Card className="bg-gradient-to-r from-gold/10 to-blue-500/10 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-black">Platform Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Avg Org Activity</p>
              <p className="text-2xl font-black text-gold">
                {orgs.length > 0 ? (analytics.totalSwaps / orgs.length).toFixed(1) : 0}
              </p>
              <p className="text-[10px] text-white/40">swaps/org/month</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Cancellation Rate</p>
              <p className="text-2xl font-black text-red-400">{analytics30d.cancellationRate}%</p>
              <p className="text-[10px] text-white/40">of all swaps</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Overtime Avoided</p>
              <p className="text-2xl font-black text-yellow-400">{analytics30d.overtimeAvoided.toFixed(1)}h</p>
              <p className="text-[10px] text-white/40">shift hours covered</p>
            </div>
            <div>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Growth (7d)</p>
              <p className="text-2xl font-black text-emerald-400">
                {analytics.totalSwaps > 0 ? ((growth7d / (analytics.totalSwaps / 4)) * 100).toFixed(0) : 0}%
              </p>
              <p className="text-[10px] text-white/40">week-over-week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
