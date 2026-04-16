"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, ArrowLeftRight, Users, Settings, LogOut, ArrowUpDown,
} from "lucide-react";
import { cn, INDUSTRY_ICONS, INDUSTRY_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const industryIcon = org ? INDUSTRY_ICONS[org.industry] : "🔄";
  const industryLabel = org ? INDUSTRY_LABELS[org.industry] : "";

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-white h-screen sticky top-0">
      {/* Logo / Org */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">SwapBoard</p>
            <p className="text-xs text-muted-foreground leading-tight">
              {industryIcon} {industryLabel}
            </p>
          </div>
        </div>
        {org && (
          <p className="mt-3 text-sm font-medium truncate text-foreground">{org.name}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name ?? "User"}</p>
            <p className="text-xs text-muted-foreground capitalize">{profile?.user_role ?? "worker"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
