import Link from "next/link";
import { Building2, Users, BarChart3, LayoutDashboard } from "lucide-react";

const PLATFORM_LINKS = [
  {
    href: "/super-admin/organizations",
    title: "Organizations",
    description: "View and manage all organizations on the platform",
    icon: Building2,
  },
  {
    href: "/super-admin/users",
    title: "Users",
    description: "Manage user accounts, roles, and access",
    icon: Users,
  },
  {
    href: "/super-admin/analytics",
    title: "Analytics",
    description: "Platform-wide usage and growth metrics",
    icon: BarChart3,
  },
  {
    href: "/super-admin/dashboard",
    title: "Dashboard",
    description: "Platform overview and key metrics",
    icon: LayoutDashboard,
  },
];

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Platform Admin</h1>
        <p className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
          SwapBoard platform management tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLATFORM_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="glass rounded-[1.5rem] p-6 border border-white/5 hover:border-gold/30 hover:bg-gold/[0.04] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0 group-hover:bg-gold group-hover:text-[#050505] transition-colors">
                <link.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight group-hover:text-gold transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs font-medium text-white/40 mt-1">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
