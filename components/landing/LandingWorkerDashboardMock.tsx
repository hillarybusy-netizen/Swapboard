"use client";

import Image from "next/image";
import {
  Home,
  CalendarDays,
  RefreshCw,
  Users,
  User,
  Zap,
  ArrowLeftRight,
  Calendar,
  Clock,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", icon: Home, active: true },
  { label: "My Shifts", icon: CalendarDays, active: false },
  { label: "Available Shifts", icon: Zap, active: false },
  { label: "Swap Board", icon: RefreshCw, active: false },
  { label: "Team", icon: Users, active: false },
  { label: "Profile", icon: User, active: false },
];

const PROFILE = {
  name: "Alex Rivera",
  initial: "A",
  role: "worker",
};

const ORG_NAME = "Harbor Kitchen";
const GREETING = "Good afternoon";
const FIRST_NAME = "Alex";
const PROFILE_PCT = 63;
const PROFILE_MISSING = ["Phone number", "Emergency contact name"];
const AVAILABLE_COUNT = 4;

const UPCOMING_SHIFTS = [
  {
    id: "1",
    title: "Evening Floor",
    date: "Fri, Jul 11",
    time: "6:00 PM – 2:00 AM",
    department: { name: "Floor", color: "#f97316" },
    badge: { label: "Upcoming", color: "text-white/50 bg-white/10" },
  },
  {
    id: "2",
    title: "Saturday Brunch",
    date: "Sat, Jul 12",
    time: "10:00 AM – 6:00 PM",
    department: { name: "Kitchen", color: "#d4af37" },
    badge: { label: "Up for Swap", color: "text-purple-400 bg-purple-500/15" },
  },
  {
    id: "3",
    title: "Bar Close",
    date: "Sun, Jul 13",
    time: "2:00 PM – 10:00 PM",
    department: { name: "Bar", color: "#8b5cf6" },
    badge: { label: "Upcoming", color: "text-white/50 bg-white/10" },
  },
];

const PENDING_SWAPS = [
  {
    id: "1",
    title: "Friday Dinner",
    message: "Awaiting someone to claim your swap",
    dateTime: "Fri, Jul 11 · 6:00 PM – 2:00 AM",
    status: "pending" as const,
  },
  {
    id: "2",
    title: "Saturday Brunch",
    message: "James K. offered to cover — awaiting manager",
    dateTime: "Sat, Jul 12 · 10:00 AM – 6:00 PM",
    status: "worker_accepted" as const,
  },
];

function MockMobileHeader() {
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md shrink-0">
      <div className="w-12 h-12 relative">
        <Image src="/logo.png" alt="" fill className="object-contain" sizes="48px" />
      </div>
      <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/20 flex items-center justify-center text-gold text-xs font-black">
        {PROFILE.initial}
      </div>
    </div>
  );
}

function MockBottomNav() {
  return (
    <nav className="md:hidden shrink-0 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-lg mx-auto px-6 h-20 flex items-center justify-between relative">
        {[
          { icon: Home, label: "Home", active: true },
          { icon: CalendarDays, label: "Shifts", active: false },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className={cn("flex flex-col items-center gap-1.5", active ? "text-gold" : "text-white/40")}>
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{label}</span>
          </div>
        ))}

        <div className="relative -top-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gold shadow-lg shadow-gold/20 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-[#050505]" />
          </div>
          <span className="text-[10px] font-bold text-white/40 mt-1">Swap</span>
        </div>

        {[
          { icon: Users, label: "Team", active: false },
          { icon: User, label: "Profile", active: false },
        ].map(({ icon: Icon, label, active }) => (
          <div key={label} className={cn("flex flex-col items-center gap-1.5", active ? "text-gold" : "text-white/40")}>
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{label}</span>
          </div>
        ))}
      </div>
    </nav>
  );
}

function MockSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-48 lg:w-56 bg-[#050505] border-r border-white/5 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />

      <div className="mb-6 border-b border-white/5">
        <div className="w-24 h-24 relative flex items-center justify-center mx-auto">
          <Image src="/logo.png" alt="" fill className="object-contain" sizes="96px" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold",
              active
                ? "bg-gold/10 text-gold shadow-lg shadow-gold/5 border border-gold/20"
                : "text-white/40"
            )}
          >
            <Icon className={cn("w-4 h-4 shrink-0", active && "scale-110")} />
            {label}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="w-full glass rounded-[2rem] p-4 border-white/5 shadow-xl text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-black border border-gold/20 shrink-0">
              {PROFILE.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{PROFILE.name}</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{PROFILE.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MockHomeContent() {
  return (
    <div className="space-y-6 pb-10 pointer-events-none select-none">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold/50">{ORG_NAME}</p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          {GREETING}, {FIRST_NAME} 👋
        </h1>
        <p className="text-sm text-white/40 font-medium">
          Here&apos;s what&apos;s happening with your shifts today.
        </p>
      </div>

      <div className="glass rounded-2xl p-5 border border-gold/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-gold/5 blur-3xl rounded-full" />
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-xs font-black text-gold uppercase tracking-widest">
                Complete Your Profile
              </span>
            </div>
            <p className="text-[11px] text-white/40 font-medium">
              Missing: {PROFILE_MISSING.join(", ")} +2 more
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gold">{PROFILE_PCT}%</span>
            <ChevronRight className="w-4 h-4 text-gold/40" />
          </div>
        </div>
        <div className="flex gap-1 relative z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < Math.round((PROFILE_PCT / 100) * 8) ? "bg-gold" : "bg-white/10"
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="btn-gold rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#050505]/20 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-[#050505]" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] font-black text-[#050505] uppercase tracking-widest leading-tight">
            Post Shift for Swap
          </span>
        </div>

        <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border border-white/10 text-center relative">
          <span className="absolute top-3 right-3 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-gold text-[#050505] text-[10px] font-black shadow-lg shadow-gold/20">
            {AVAILABLE_COUNT}
          </span>
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-gold" strokeWidth={2} />
          </div>
          <span className="block text-[11px] font-black text-gold uppercase tracking-widest leading-tight">
            Available Shifts
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Upcoming Shifts
          </h2>
          <span className="text-[10px] font-bold text-gold/60 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div className="space-y-2.5">
          {UPCOMING_SHIFTS.map((shift) => (
            <div
              key={shift.id}
              className="glass rounded-2xl p-4 border border-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{shift.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                      <Calendar className="w-3 h-3" />
                      {shift.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/40">
                      <Clock className="w-3 h-3" />
                      {shift.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: shift.department.color }}
                    />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                      {shift.department.name}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0",
                    shift.badge.color
                  )}
                >
                  {shift.badge.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Bell className="w-3.5 h-3.5 text-gold/60" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Swap Activity
          </h2>
        </div>
        <div className="space-y-2">
          {PENDING_SWAPS.map((swap) => (
            <div
              key={swap.id}
              className="glass rounded-2xl p-4 border border-gold/10 bg-gold/3 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                {swap.status === "worker_accepted" ? (
                  <CheckCircle2 className="w-4 h-4 text-gold" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gold/60" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white leading-tight">{swap.title}</p>
                <p className="text-[11px] text-white/40 font-medium mt-0.5">{swap.message}</p>
                <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest mt-1">
                  {swap.dateTime}
                </p>
              </div>
              <div className="shrink-0 p-1.5 rounded-lg bg-white/5">
                <ChevronRight className="w-4 h-4 text-white/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingWorkerDashboardMock() {
  return (
    <div className="flex min-h-[820px] bg-[#050505] text-left">
      <MockSidebar />
      <div className="flex-1 relative flex flex-col min-w-0 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />
        <MockMobileHeader />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 md:py-12 pb-24 md:pb-12 overflow-hidden">
          <MockHomeContent />
        </main>
        <MockBottomNav />
      </div>
    </div>
  );
}
