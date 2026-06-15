"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw, Home, CalendarDays, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkerBottomNav() {
  const pathname = usePathname();

  // We consider "Shifts" active if it's the my-shifts path (Home will also point there, so we distinguish with logic or just make Home active for root)
  // For simplicity, let's say "Home" is always /my-shifts. "Shifts" is /my-shifts?tab=history or similar.
  // Wait, if both point to /my-shifts, both will be active. Let's make "Home" point to /my-shifts, and "Shifts" point to /swap-requests? Or maybe /my-shifts?tab=history.
  // Actually, let's keep them as defined in the layout.

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="max-w-lg mx-auto px-6 h-20 flex items-center justify-between relative">
        <Link 
          href="/my-shifts" 
          className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            pathname === "/my-shifts" ? "text-gold" : "text-white/40 hover:text-white/60"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        
        <Link 
          href="/swap-requests" 
          className={cn(
            "flex flex-col items-center gap-1.5 transition-colors",
            pathname === "/swap-requests" ? "text-gold" : "text-white/40 hover:text-white/60"
          )}
        >
          <CalendarDays className="w-6 h-6" />
          <span className="text-[10px] font-bold">Shifts</span>
        </Link>

        {/* Center Swap Button */}
        <div className="relative -top-6 flex flex-col items-center">
          <Link 
            href="/swap-requests" 
            className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-transform"
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
