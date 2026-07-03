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
    <aside className="hidden md:flex flex-col w-64 bg-[#050505] h-screen sticky top-0 border-r border-white/5 relative overflow-hidden group">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />

      {/* Brand Logo - No Padding */}
      <div className="mb-6">
        <AnimatedLogo size="lg" showText={false} className="border-b border-white/5" />
      </div>

      {org && (
        <div className="px-8 mb-6">
          <div className="px-4 py-3 rounded-2xl glass border-white/5 shadow-inner">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Organization</p>
            <p className="text-sm font-bold truncate text-white/90">{org.name}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {filteredNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} prefetch>
              <span
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
                  active
                    ? "bg-gold/10 text-gold shadow-lg shadow-gold/5 border border-gold/20"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0 transition-transform", active && "scale-110")} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Session */}
      <div className="p-4 mt-auto">
        <ProfileDropdown profile={profile} align="center">
          <button className="w-full glass rounded-[2rem] p-4 border-white/5 shadow-xl hover:border-white/10 transition-all text-left group/profile">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-black border border-gold/20 shrink-0 group-hover/profile:scale-105 transition-transform">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{profile?.full_name ?? "User"}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{profile?.user_role ?? "worker"}</p>
                {(profile as any)?.member_id && (
                  <p className="text-[9px] text-white/40 font-semibold tracking-wider mt-0.5">{(profile as any).member_id}</p>
                )}
              </div>
            </div>
          </button>
        </ProfileDropdown>
      </div>
    </aside>
  );
}
