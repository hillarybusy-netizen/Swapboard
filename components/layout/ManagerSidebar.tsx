"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ArrowLeftRight,
  LogOut,
  Menu,
  UserPlus,
  Bell,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Organization, Profile } from "@/lib/database.types";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/shifts", label: "Shifts", icon: Calendar },
  { href: "/swaps", label: "Swap Requests", icon: ArrowLeftRight },
  { href: "/claims", label: "Shift Claims", icon: UserPlus },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface ManagerSidebarProps {
  org?: Organization | null;
  profile?: Profile | null;
}

function NavContent({ org, profile }: ManagerSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0">
        <div className="mb-4">
          <AnimatedLogo size="lg" showText={false} className="border-b border-white/5" />
        </div>

        {org && (
          <div className="px-8 mb-4">
            <div className="px-4 py-3 rounded-2xl glass border-white/5 shadow-inner">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Organization</p>
              <p className="text-sm font-bold truncate text-white/90">{org.name}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-4 space-y-2 py-2 no-scrollbar">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
      <div className="p-4 shrink-0 border-t border-white/5">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full glass rounded-[2rem] p-4 border-white/5 shadow-xl hover:border-red-500/20 hover:bg-red-500/5 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-black border border-gold/20 shrink-0 group-hover:scale-105 transition-transform">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? "M"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{profile?.full_name ?? "Manager"}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">manager</p>
              </div>
              <LogOut className="w-4 h-4 text-white/20 group-hover:text-red-400 transition-colors shrink-0" />
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

export function ManagerSidebar({ org, profile }: ManagerSidebarProps = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#050505] h-dvh sticky top-0 border-r border-white/5 relative">
        <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
        <NavContent org={org} profile={profile} />
      </aside>

      {/* Mobile Hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-[#050505] border-white/5 h-full flex flex-col">
          <NavContent org={org} profile={profile} />
        </SheetContent>
      </Sheet>
    </>
  );
}
