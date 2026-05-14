import { getAdminStats, getOrganizations } from "@/lib/actions/admin";
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
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
