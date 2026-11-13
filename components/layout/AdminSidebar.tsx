"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ArrowLeftRight,
  Users,
  Settings,
  Bell,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  UserPlus,
  MousePointerClick,
  Building2,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Organization, Profile } from "@/lib/database.types";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notifications",   label: "Notifications", icon: Bell },
  { href: "/shifts",          label: "Shifts", icon: Calendar },
  { href: "/swaps",           label: "Swap Requests", icon: ArrowLeftRight },
  { href: "/admin/claims",    label: "Shift Claims", icon: UserPlus },
  { href: "/analytics",       label: "Analytics", icon: BarChart3 },
  { href: "/team",            label: "Team", icon: Users },
  { href: "/admin/settings",  label: "Settings", icon: Settings },
];

const SUPER_ADMIN_NAV_ITEMS = [
  { href: "/super-admin/dashboard",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/organizations",      label: "Organizations", icon: Building2 },
  { href: "/super-admin/users",              label: "All Users & Accounts", icon: Users },
  { href: "/super-admin/audit-logs",         label: "Platform Audit Log", icon: History },
  { href: "/super-admin/analytics",          label: "Platform Analytics", icon: BarChart3 },
  { href: "/super-admin/settings",           label: "Platform Settings", icon: Settings },
  { href: "/super-admin/website-analytics",  label: "Website Analytics", icon: MousePointerClick },
];

interface AdminSidebarProps {
  org?: Organization | null;
  profile?: Profile | null;
  isSuperAdmin?: boolean;
}

function NavContent({ org, profile, isSuperAdmin, onNavigate }: AdminSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isSuper = Boolean(isSuperAdmin || profile?.user_role === "super_admin" || (!org && !profile));
  const navItems = isSuper ? SUPER_ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0">
        {/* Brand Logo */}
        <div className="mb-4 flex justify-center border-b border-white/5 pb-4 pt-4">
          <AnimatedLogo size="lg" showText={false} />
        </div>

        {/* Org Badge */}
        {org && (
          <div className="px-8 mb-4">
            <div className="px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] font-medium text-white/45 mb-0.5">Organization</p>
              <p className="text-sm font-bold truncate text-white/90">{org.name}</p>
            </div>
          </div>
        )}

        {/* Admin badge */}
        <div className="px-8 mb-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold/10 border border-gold/20">
            <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
              {isSuper ? "Super Admin" : "Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation — scrolls when items overflow */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 space-y-0.5 py-2 no-scrollbar">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} prefetch onClick={onNavigate}>
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

      {/* User Session — always visible at bottom */}
      <div className="p-4 shrink-0 border-t border-white/5">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full glass rounded-2xl p-4 border-white/5 hover:border-red-500/20 hover:bg-red-500/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-semibold border border-gold/20 shrink-0 transition-transform">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? (isSuper ? "S" : "A")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{profile?.full_name ?? (isSuper ? "Super Admin" : "Admin")}</p>
                <p className="text-[11px] text-white/45 font-bold uppercase tracking-wider">
                  {isSuper ? "super_admin" : (profile?.user_role ?? "org_admin")}
                </p>
              </div>
              <LogOut className="w-4 h-4 text-white/35 group-hover:text-red-400 transition-colors shrink-0" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({ org, profile, isSuperAdmin }: AdminSidebarProps = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#070707] h-dvh sticky top-0 border-r border-white/5 relative">
                <NavContent org={org} profile={profile} isSuperAdmin={isSuperAdmin} />
      </aside>

      {/* Mobile Hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-[#050505] border-white/5 h-full flex flex-col">
          <NavContent org={org} profile={profile} isSuperAdmin={isSuperAdmin} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
