"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Users,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Internal Settings", icon: Settings },
];

function NavContent() {
  const pathname = usePathname();

  return (
    <>
      {/* Brand Header */}
      <div className="p-8 pb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
          <ShieldCheck className="text-black w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-white">SWAPBOARD</h1>
          <p className="text-[10px] font-black text-gold/60 uppercase tracking-[0.2em]">Platform Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                isActive
                  ? "bg-white/[0.03] text-white shadow-inner"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.01]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-gold" : "group-hover:text-white/40"
              )} />
              <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">{item.label}</span>

              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gold rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-white/5 pt-8 pb-8">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-4 px-4 py-3.5 text-white/30 hover:text-red-400 transition-colors w-full group overflow-hidden"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">Sign Out</span>
        </button>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-72 bg-[#080808] border-r border-white/5 flex flex-col h-screen sticky top-0 hidden md:flex">
        <NavContent />
      </div>

      {/* Mobile Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-[#080808] border-white/5">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
