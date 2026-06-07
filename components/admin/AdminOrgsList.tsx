"use client";

import { AdminSearch } from "./AdminSearch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";
import { formatCurrency } from "@/lib/utils";
import { Globe, Settings2, ExternalLink, CalendarDays } from "lucide-react";
import { Plan } from "@/lib/database.types";

function cn(...inputs: (string | boolean | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function AdminOrgsList({ orgs }: { orgs: any[] }) {
  return (
    <AdminSearch
      placeholder="Search by name or subdomain..."
      items={orgs}
      filterFn={(org, q) =>
        org.name?.toLowerCase().includes(q) ||
        org.subdomain?.toLowerCase().includes(q) ||
        org.industry?.toLowerCase().includes(q)
      }
    >
      {(filtered) => (
        <div className="grid gap-6">
          {filtered.map((org: any) => (
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
                    <p className="text-xs font-bold text-white/60">{formatCurrency(PLAN_LIMITS[org.plan as Plan]?.price || 0)} / mo</p>
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
      )}
    </AdminSearch>
  );
}
