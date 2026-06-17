"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, Home, CalendarDays, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="max-w-lg mx-auto px-6 h-20 flex items-center justify-between relative">
        <Link
          href="/home"
          className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            pathname === "/home" ? "text-gold" : "text-white/40 hover:text-white/60"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        <Link
          href="/my-shifts"
          className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            pathname === "/my-shifts" ? "text-gold" : "text-white/40 hover:text-white/60"
          )}
        >
          <CalendarDays className="w-6 h-6" />
          <span className="text-[10px] font-bold">Shifts</span>
        </Link>

        {/* Center Swap Button */}
        <div className="relative -top-6 flex flex-col items-center">
          <Link
            href="/swap"
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95",
              pathname === "/swap"
                ? "bg-gold shadow-gold/40"
                : "bg-gold shadow-gold/20"
            )}
          >
            <RefreshCw className="w-8 h-8 text-[#050505]" />
          </Link>
          <span className="text-[10px] font-bold text-white/40 mt-1">Swap</span>
        </div>

        <Link
          href="/my-team"
          className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            pathname === "/my-team" ? "text-gold" : "text-white/40 hover:text-white/60"
          )}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold">Team</span>
        </Link>

        <Link
          href="/my-profile"
          className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            pathname === "/my-profile" ? "text-gold" : "text-white/40 hover:text-white/60"
          )}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
