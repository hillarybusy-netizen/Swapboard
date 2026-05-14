import { getOrganizations } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Building2,
  Search,
  Globe,
  Settings2,
  ExternalLink,
  CalendarDays
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrganizations() {
  const orgs = await getOrganizations();

  const prices: any = {
    starter: 49,
    pro: 199,
    enterprise: 999,
    trial: 0
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Organization Manager</h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
            Tracking <span className="text-gold/60">{orgs.length} Organizations</span> on Swapboard
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
          <input
            type="text"
            placeholder="Search by name or subdomain..."
            className="bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-gold/30 focus:bg-white/[0.07] transition-all w-full md:w-80"
          />
        </div>
      </div>

      <div className="grid gap-6">
        {orgs.map((org: any) => (
          <div key={org.id} className="glass rounded-[2rem] p-8 border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] blur-3xl -z-10" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-2xl font-black text-white/20 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                  {org.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-black text-white tracking-tight">{org.name}</h2>
                    <Badge className={cn(
                      "rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-widest border-none",
                      org.plan === "trial" ? "bg-white/5 text-white/40" : "bg-gold text-[#050505]"
                    )}>
                      {org.plan}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
                    <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {org.subdomain || "no-subdomain"}.swapboard.app</span>
                    <span>·</span>
                    <span>{org.industry}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 lg:gap-12">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Signed Up</p>
                  <p className="text-xs font-bold text-white/60">{new Date(org.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Subscription</p>
                  <p className="text-xs font-bold text-white/60">{formatCurrency(prices[org.plan] || 0)} / mo</p>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
