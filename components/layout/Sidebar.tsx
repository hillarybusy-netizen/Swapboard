"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, ArrowLeftRight, Users, Settings, LogOut, Bell, BarChart3, UserPlus,
} from "lucide-react";
import { cn, INDUSTRY_ICONS, INDUSTRY_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions";
import type { Organization, Profile } from "@/lib/database.types";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/shifts", label: "Shifts", icon: Calendar },
  { href: "/swaps", label: "Swap Requests", icon: ArrowLeftRight },
  { href: "/claims", label: "Shift Claims", icon: UserPlus },
  { href: "/analytics", label: "Analytics", icon: LayoutDashboard },
  { href: "/team", label: "Team", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  org: Organization | null;
  profile: Profile | null;
}

export function Sidebar({ org, profile }: SidebarProps) {
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
  }

  const industryIcon = org ? INDUSTRY_ICONS[org.industry] : "🔄";
  const industryLabel = org ? INDUSTRY_LABELS[org.industry] : "";

  // Filter navigation items based on role
  const filteredNavItems = NAV_ITEMS.filter(item => {
    // Managers cannot access Team or Settings
    if (profile?.user_role === "manager" && (item.href === "/team" || item.href === "/settings")) {
      return false;
    }
    return true;
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#070707] h-screen sticky top-0 border-r border-white/5 relative overflow-hidden group">
      {/* Mesh background */}
      
      {/* Brand Logo - No Padding */}
      <div className="mb-6">
        <AnimatedLogo size="lg" showText={false} className="border-b border-white/5" />
      </div>

      {org && (
        <div className="px-8 mb-6">
          <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[11px] font-medium text-white/45 mb-0.5">Organization</p>
            <p className="text-sm font-bold truncate text-white/90">{org.name}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {filteredNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} prefetch>
              <span
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-gold/[0.09] text-gold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-gold"
                    : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold" : "opacity-70")} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Session */}
      <div className="p-4 mt-auto">
        <ProfileDropdown profile={profile} align="center">
          <button className="w-full glass rounded-2xl p-4 border-white/5 hover:border-white/10 transition-all text-left group/profile">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold border border-gold/20 shrink-0">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{profile?.full_name ?? "User"}</p>
                <p className="text-[11px] text-white/45 font-bold uppercase tracking-wider">{profile?.user_role ?? "worker"}</p>
                {(profile as any)?.member_id && (
                  <p className="text-[11px] text-white/55 font-semibold tracking-wider mt-0.5">{(profile as any).member_id}</p>
                )}
              </div>
            </div>
          </button>
        </ProfileDropdown>
      </div>
    </aside>
  );
}
