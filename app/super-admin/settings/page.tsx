import Link from "next/link";
import { Building2, Users, BarChart3, LayoutDashboard, History, MousePointerClick, ShieldCheck, Server, Key, BellRing } from "lucide-react";

const PLATFORM_LINKS = [
  {
    href: "/super-admin/dashboard",
    title: "Platform Console",
    description: "Multi-tenant overview, live status, and growth metrics",
    icon: LayoutDashboard,
  },
  {
    href: "/super-admin/organizations",
    title: "Organizations Directory",
    description: "Manage customer organizations, subscription tiers, and domains",
    icon: Building2,
  },
  {
    href: "/super-admin/users",
    title: "All Users & Staff",
    description: "Global user directory, role permissions, and access status",
    icon: Users,
  },
  {
    href: "/super-admin/audit-logs",
    title: "Platform Audit Log",
    description: "Real-time compliance ledger of shift trades and operational events",
    icon: History,
  },
  {
    href: "/super-admin/analytics",
    title: "Shift & Team Analytics",
    description: "Shift fulfillment, trade velocities, and department stats",
    icon: BarChart3,
  },
  {
    href: "/super-admin/website-analytics",
    title: "Website Traffic & GA4",
    description: "Real-time landing page views, visitor metrics, and click tracking",
    icon: MousePointerClick,
  },
];

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Global Administration
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Platform Management</h1>
        <p className="text-white/40 text-xs md:text-sm">
          Core configuration tools, audit records, and platform governance for Swapboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLATFORM_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="glass rounded-[1.75rem] p-6 border border-white/5 hover:border-gold/30 hover:bg-gold/[0.03] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 shrink-0 group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all">
                <link.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white tracking-tight group-hover:text-gold transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs font-medium text-white/40 mt-1 leading-relaxed">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Security & System Info Card */}
      <div className="glass rounded-[2rem] p-6 md:p-8 border-white/5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">System Runtime & Security Architecture</h3>
            <p className="text-xs text-white/40">Multi-tenant isolation backed by Supabase Postgres RLS policies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Auth Protocol</p>
            <p className="font-bold text-white mt-1">Supabase SSR + PKCE</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Realtime Engine</p>
            <p className="font-bold text-white mt-1">WebSocket Broadcasts</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-wider text-white/30">Analytics Provider</p>
            <p className="font-bold text-white mt-1">Google Analytics 4</p>
          </div>
        </div>
      </div>
    </div>
  );
}
