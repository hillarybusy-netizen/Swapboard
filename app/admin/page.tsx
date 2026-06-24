import { getAdminStats, getOrganizations, getDetailedUsers } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  Clock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const stats = await getAdminStats();
  const orgs = await getOrganizations();
  const users = await getDetailedUsers();

  const cards = [
    { 
      label: "Total Organizations", 
      value: stats.orgCount, 
      icon: Building2, 
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    { 
      label: "Total Users", 
      value: stats.userCount, 
      icon: Users, 
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    { 
      label: "Est. MRR", 
      value: formatCurrency(stats.estimatedMRR), 
      icon: CreditCard, 
      color: "text-gold", 
      bg: "bg-gold/10"
    },
    { 
      label: "Active Trials", 
      value: stats.planCounts.trial || 0, 
      icon: Clock, 
      color: "text-orange-400",
      bg: "bg-orange-400/10"
    },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Platform Overview</h1>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Real-time business health and growth metrics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-[2rem] p-8 border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} blur-3xl -z-10`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="text-white/10 group-hover:text-gold/20 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{card.label}</p>
            <h2 className="text-3xl font-black text-white">{card.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Signups */}
        <div className="lg:col-span-2 glass rounded-[2.5rem] p-10 border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Recent Sign-ups</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-gold/80 transition-colors">View All</button>
          </div>
          
          <div className="space-y-6">
            {orgs.slice(0, 5).map((org: any) => (
              <div key={org.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-white/20 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white tracking-tight">{org.name}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{org.industry} · {new Date(org.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-widest border-none",
                  org.plan === "trial" ? "bg-white/5 text-white/40" : "bg-gold text-[#050505]"
                )}>
                  {org.plan}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="glass rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gold/[0.02] -z-10" />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Plan Distribution</h3>
          
          <div className="space-y-8">
            {Object.entries(stats.planCounts).map(([plan, count]: [any, any]) => {
              const percentage = Math.round((count / stats.orgCount) * 100);
              return (
                <div key={plan}>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{plan}</p>
                    <p className="text-[10px] font-black text-white">{count} ({percentage}%)</p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gold shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recently Joined Members */}
      <div className="glass rounded-[2.5rem] p-10 border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Recently Joined Members</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">New signups and invited members</p>
          </div>
          <a href="/admin/users" className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-gold/80 transition-colors">View All</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Member</th>
                <th className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Organization</th>
                <th className="text-left py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Plan</th>
                <th className="text-center py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Swaps</th>
                <th className="text-right py-3 px-4 font-bold text-white/60 text-[10px] uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map((user: any) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white/20 text-xs">
                        {user.full_name?.charAt(0) ?? "?"}
                      </div>
                      <span className="font-bold text-white">{user.full_name ?? "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-white/60 text-[13px]">{user.email}</td>
                  <td className="py-4 px-4 text-white/60 text-[13px]">{user.organization?.name ?? "N/A"}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                      user.organization?.plan === "trial" ? "bg-white/5 text-white/40" :
                      user.organization?.plan === "starter" ? "bg-blue-500/10 text-blue-400" :
                      user.organization?.plan === "growth" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-gold/10 text-gold"
                    )}>
                      {user.organization?.plan ?? "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-bold text-white">{user.swapCount}</span>
                  </td>
                  <td className="py-4 px-4 text-right text-white/60 text-[13px]">
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
