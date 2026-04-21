"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, ArrowLeftRight, Users, Settings, LogOut, ArrowUpDown, RefreshCw,
} from "lucide-react";
import { cn, INDUSTRY_ICONS, INDUSTRY_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions";
import type { Organization, Profile } from "@/lib/database.types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/shifts", label: "Shifts", icon: Calendar },
  { href: "/swaps", label: "Swap Requests", icon: ArrowLeftRight },
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

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#050505] h-screen sticky top-0 border-r border-white/5 relative overflow-hidden group">
      {/* Mesh background */}
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />

      {/* Org Header */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/10 shadow-lg shadow-gold/5 transition-transform group-hover:scale-110 duration-500">
            <RefreshCw className="w-5 h-5 text-gold" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-white">Swap<span className="text-gold">Board</span></span>
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold -mt-1">{industryLabel}</span>
          </div>
        </div>

        {org && (
          <div className="px-4 py-3 rounded-2xl glass border-white/5 shadow-inner">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Organization</p>
            <p className="text-sm font-bold truncate text-white/90">{org.name}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-2">
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
      <div className="p-4 mt-auto">
        <div className="glass rounded-[2rem] p-4 border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-black border border-gold/20">
              {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name ?? "User"}</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{profile?.user_role ?? "worker"}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-center gap-2 text-white/40 hover:text-gold hover:bg-gold/10 rounded-xl transition-all duration-300 font-bold" 
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  );
}
