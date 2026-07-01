"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, ArrowLeftRight, Users, Settings, Bell, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Organization, Profile } from "@/lib/database.types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/shifts", label: "Shifts", icon: Calendar },
  { href: "/swaps", label: "Swap Requests", icon: ArrowLeftRight },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface MobileNavProps {
  profile?: Profile | null;
  org?: Organization | null;
}

export function MobileNav({ profile, org }: MobileNavProps = {}) {
  const pathname = usePathname();

  // Filter navigation items based on role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Managers cannot access Team or Settings
    if (profile?.user_role === "manager" && (item.href === "/team" || item.href === "/settings")) {
      return false;
    }
    return true;
  });

  return (
    <div className="md:hidden fixed bottom-6 inset-x-6 z-50">
      <nav className="glass-nav rounded-full border-white/10 shadow-2xl p-2 px-4 shadow-gold/5">
        <div className="flex items-center justify-around h-14">
          {filteredNavItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center flex-1 h-full gap-1 group">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  active ? "bg-gold text-[#050505] shadow-lg shadow-gold/20" : "text-white/40 group-hover:text-white"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest transition-colors",
                  active ? "text-gold" : "text-white/20"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}


