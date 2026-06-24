import { createClient } from "@/lib/supabase/server";
import { getOrganizations } from "@/lib/actions/admin";
import { calculateBasicAnalytics, calculateAdvancedAnalytics, calculateEnterpriseAnalytics } from "@/lib/advanced-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Activity, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const orgs = await getOrganizations();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get all swaps across all organizations
  const { data: swapsData } = await supabase
    .from("swap_requests")
    .select("*, shift:shifts(start_time, end_time, department_id)")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  const swaps = (swapsData ?? []) as any[];

  // Calculate aggregate analytics
  const analytics = calculateBasicAnalytics(swaps);

  // Calculate per-organization stats
  const orgStats = orgs.map((org: any) => {
    const orgSwaps = swaps.filter((s: any) => s.organization_id === org.id);
    const orgAnalytics = calculateBasicAnalytics(orgSwaps);
    return {
      name: org.name,
      totalSwaps: orgAnalytics.totalSwaps,
      fulfillmentRate: orgAnalytics.fulfillmentRate,
      activeSwaps: orgAnalytics.activeSwaps,
      plan: org.plan,
    };
  }).filter((org: any) => org.totalSwaps > 0); // Only show orgs with activity

  // Prepare data for charts
  const planDistribution = [
    { name: "Trial", value: orgs.filter((o: any) => o.plan === "trial").length },
    { name: "Starter", value: orgs.filter((o: any) => o.plan === "starter").length },
    { name: "Growth", value: orgs.filter((o: any) => o.plan === "growth").length },
    { name: "Enterprise", value: orgs.filter((o: any) => o.plan === "enterprise").length },
  ].filter((item) => item.value > 0);

  const COLORS = ["#ff6b6b", "#4c6ef5", "#15aabf", "#ffd43b"];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Platform Analytics</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">30-Day Aggregate Performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Total Swaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{analytics.totalSwaps}</p>
            <p className="text-[10px] text-white/40 mt-1">Across all orgs</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Fulfillment Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-emerald-400">{analytics.fulfillmentRate}%</p>
            <p className="text-[10px] text-white/40 mt-1">Avg success</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Active Swaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-orange-400">{analytics.activeSwaps}</p>
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
            <p className="text-4xl font-black text-purple-400">{orgs.length}</p>
            <p className="text-[10px] text-white/40 mt-1">Active customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        {planDistribution.length > 0 && (
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader>
              <CardTitle className="text-base font-bold">Plan Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Organizations */}
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orgStats.slice(0, 5).map((org: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{org.name}</p>
                    <p className="text-[10px] text-white/40 capitalize">{org.plan} plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold">{org.totalSwaps}</p>
                    <p className="text-[10px] text-white/40">{org.fulfillmentRate}% rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Performance Table */}
      {orgStats.length > 0 && (
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-bold">Organization Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Organization</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Swaps</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Fulfillment</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Active</th>
                    <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {orgStats.map((org: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">{org.name}</td>
                      <td className="text-right py-4 px-4 text-white/80">{org.totalSwaps}</td>
                      <td className="text-right py-4 px-4">
                        <span className={org.fulfillmentRate >= 70 ? "text-emerald-400" : "text-orange-400"}>
                          {org.fulfillmentRate}%
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-white/80">{org.activeSwaps}</td>
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
    </div>
  );
}
