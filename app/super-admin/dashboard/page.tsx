import { getAdminStats, getOrganizations, getDetailedUsers } from "@/lib/actions/admin";
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  ArrowLeftRight,
  Calendar,
  ShieldCheck,
  Activity,
  History,
  CheckCircle2,
  Server,
  Sparkles,
  Zap
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default async function AdminOverview() {
  const stats = await getAdminStats();
  const orgs = await getOrganizations();
  const users = await getDetailedUsers();

  const metrics = [
    { 
      label: "Total Organizations", 
      value: stats.orgCount, 
      sub: `${stats.planCounts.trial || 0} on free trial`,
      icon: Building2, 
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      trend: "Live",
      href: "/super-admin/organizations"
    },
    { 
      label: "All Users & Staff", 
      value: stats.userCount, 
      sub: `${stats.activeUserCount || stats.userCount} active`,
      icon: Users, 
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      trend: "Healthy",
      href: "/super-admin/users"
    },
    { 
      label: "Total Shifts Scheduled", 
      value: stats.shiftsCount || 0, 
      sub: "Across all organizations",
      icon: Calendar, 
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      trend: "Shift Hub",
      href: "/super-admin/analytics"
    },
    { 
      label: "Shift Swap Volume", 
      value: stats.swapsCount || 0, 
      sub: `${stats.approvedSwapsCount || 0} approved`,
      icon: ArrowLeftRight, 
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      trend: "Swaps",
      href: "/super-admin/audit-logs"
    },
    { 
      label: "Est. Platform MRR", 
      value: formatCurrency(stats.estimatedMRR), 
      sub: "Subscription run rate",
      icon: CreditCard, 
      color: "text-gold", 
      bg: "bg-gold/10",
      trend: "Revenue",
      href: "/super-admin/analytics"
    },
    { 
      label: "Active Trials", 
      value: stats.planCounts.trial || 0, 
      sub: "14-day evaluation",
      icon: Clock, 
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      trend: "Onboarding",
      href: "/super-admin/organizations"
    },
  ];

  return (
    <div className="space-y-10 max-w-7xl pb-16">
      {/* Top Console Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-gold" />
              Swapboard Platform Executive Console
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Platform Control Center</h1>
          <p className="text-white/40 text-xs md:text-sm mt-1">
            Real-time multi-tenant monitoring, shift activity, and organization intelligence
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/super-admin/audit-logs"
            className="px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-gold/10 border border-white/10 hover:border-gold/30 text-white hover:text-gold text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <History className="w-3.5 h-3.5" />
            <span>Platform Audit Log</span>
          </Link>
          <Link
            href="/super-admin/website-analytics"
            className="px-4 py-2.5 rounded-2xl bg-gold text-black hover:bg-gold/90 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-gold/20"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Website Analytics</span>
          </Link>
        </div>
      </div>

      {/* System Infrastructure Health Strip */}
      <div className="glass rounded-2xl p-4 md:px-6 border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          <span className="font-bold text-white tracking-tight">Core Infrastructure: All Systems Operational</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-[11px] text-white/40 font-mono">
          <span className="flex items-center gap-1.5">
            <Server className="w-3 h-3 text-emerald-400" /> Supabase DB: <strong className="text-white/70">Online</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400" /> Realtime Sync: <strong className="text-white/70">Active</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Resend Mail: <strong className="text-white/70">Ready</strong>
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metrics.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="glass rounded-[2rem] p-6 border-white/5 hover:border-gold/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all group relative overflow-hidden block"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} blur-3xl -z-10`} />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} border border-white/5`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-2.5 py-1 rounded-full group-hover:text-gold transition-colors">
                {card.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{card.label}</p>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-black text-white group-hover:text-gold transition-colors">{card.value}</h2>
              <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-white/40 mt-1 font-medium">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Middle Section: Recent Shift Swaps Across Platform & Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shift Swaps Stream */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-7 md:p-8 border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-gold" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Shift Swap Requests</h3>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-0.5">
                Real-time trades submitted across teams
              </p>
            </div>
            <Link
              href="/super-admin/audit-logs"
              className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-gold/80 transition-colors"
            >
              View All Logs →
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentSwaps && stats.recentSwaps.length > 0 ? (
              stats.recentSwaps.map((swap: any) => (
                <div
                  key={swap.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center font-bold text-xs shrink-0">
                      {swap.requester?.full_name?.charAt(0) ?? "S"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {swap.requester?.full_name ?? "Team Member"}{" "}
                        <span className="text-white/30 font-normal">in</span>{" "}
                        <span className="text-gold font-semibold">{swap.organization?.name ?? "Team"}</span>
                      </p>
                      <p className="text-[11px] text-white/40 truncate max-w-sm">
                        {swap.reason || "Shift swap request submitted"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider border",
                        swap.status === "manager_approved"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : swap.status === "pending"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-white/5 text-white/40 border-white/10"
                      )}
                    >
                      {swap.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-white/30 font-mono shrink-0">
                      {new Date(swap.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-white/30">
                No shift swap activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Plan Breakdown & SaaS Distribution */}
        <div className="glass rounded-[2.5rem] p-7 md:p-8 border-white/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-gold/[0.02] -z-10" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Plan Distribution</h3>
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-6">
              Active tiers across {stats.orgCount} organizations
            </p>

            <div className="space-y-5">
              {Object.entries(stats.planCounts).map(([plan, count]: [any, any]) => {
                const percentage = stats.orgCount > 0 ? Math.round((count / stats.orgCount) * 100) : 0;
                return (
                  <div key={plan} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold uppercase tracking-wider text-white/70 text-[11px]">{plan}</span>
                      <span className="font-mono text-[11px] text-white/40">{count} orgs ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          plan === "enterprise" ? "bg-gold" :
                          plan === "growth" ? "bg-emerald-400" :
                          plan === "starter" ? "bg-blue-400" : "bg-white/30"
                        )}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Link
              href="/super-admin/organizations"
              className="w-full py-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Manage All Organizations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recently Joined Members */}
      <div className="glass rounded-[2.5rem] p-7 md:p-8 border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">Recently Joined Staff & Members</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-0.5">
              Platform-wide user enrollments
            </p>
          </div>
          <Link
            href="/super-admin/users"
            className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-gold/80 transition-colors"
          >
            View All Users →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-3 px-4 font-bold text-white/40 text-[10px] uppercase tracking-wider">Member</th>
                <th className="py-3 px-4 font-bold text-white/40 text-[10px] uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 font-bold text-white/40 text-[10px] uppercase tracking-wider">Organization</th>
                <th className="py-3 px-4 font-bold text-white/40 text-[10px] uppercase tracking-wider">Role</th>
                <th className="text-center py-3 px-4 font-bold text-white/40 text-[10px] uppercase tracking-wider">Swaps</th>
                <th className="text-right py-3 px-4 font-bold text-white/40 text-[10px] uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {users.slice(0, 8).map((user: any) => (
                <tr key={user.id} className="hover:bg-white/[0.015] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/40 text-xs">
                        {user.full_name?.charAt(0) ?? "U"}
                      </div>
                      <span className="font-bold text-white text-xs">{user.full_name ?? "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-white/50 text-xs font-mono">{user.email}</td>
                  <td className="py-3.5 px-4 text-white/70 text-xs font-medium">{user.organization?.name ?? "No Org"}</td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      user.user_role === "super_admin" ? "bg-gold/10 text-gold border-gold/30" :
                      user.user_role === "org_admin" ? "bg-purple-500/10 text-purple-300 border-purple-500/20" :
                      user.user_role === "manager" ? "bg-blue-500/10 text-blue-300 border-blue-500/20" :
                      "bg-white/5 text-white/40 border-white/10"
                    )}>
                      {user.user_role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-white text-xs">{user.swapCount}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-white/40 text-xs">
                    {new Date(user.created_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
