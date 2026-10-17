"use client";

import { useState } from "react";
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
  Plus,
  Check,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Search,
  Filter,
  X,
  ExternalLink,
  MessageSquare,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "home" | "shifts" | "available" | "swap" | "team" | "profile";

const PROFILE = {
  name: "Alex Rivera",
  initial: "A",
  role: "Floor & Bar Server",
  email: "alex.rivera@harborkitchen.com",
  phone: "+1 (416) 555-0198",
  hourlyRate: "$19.50",
  timezone: "Eastern Time (EST)",
  department: "Floor & Dining",
};

const ORG_NAME = "Harbor Kitchen";

export function LandingWorkerDashboardMock() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [shiftsFilter, setShiftsFilter] = useState<"all" | "upcoming" | "completed" | "swapped">("all");
  const [claimedShiftIds, setClaimedShiftIds] = useState<string[]>([]);
  const [activeSwapList, setActiveSwapList] = useState([
    {
      id: "s1",
      title: "Friday Dinner Service",
      date: "Fri, Jul 11 · 6:00 PM – 2:00 AM",
      department: "Floor",
      status: "pending",
      message: "Looking for cover: family event",
      canCancel: true,
    },
    {
      id: "s2",
      title: "Saturday Brunch Rush",
      date: "Sat, Jul 12 · 10:00 AM – 6:00 PM",
      department: "Kitchen",
      status: "worker_accepted",
      message: "James K. offered to cover — pending manager",
      canCancel: false,
    },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPostSwapModal, setShowPostSwapModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navItems = [
    { key: "home" as TabType, label: "Home", icon: Home },
    { key: "shifts" as TabType, label: "My Shifts", icon: CalendarDays },
    { key: "available" as TabType, label: "Available Shifts", icon: Zap, badge: 4 - claimedShiftIds.length },
    { key: "swap" as TabType, label: "Swap Board", icon: RefreshCw },
    { key: "team" as TabType, label: "Team", icon: Users },
    { key: "profile" as TabType, label: "Profile", icon: User },
  ];

  return (
    <div className="flex h-full bg-[#050505] text-left select-text relative overflow-hidden text-white font-sans">
      {/* Toast Notification in Mock */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-gold text-[#050505] text-xs font-black shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar — always visible, icon-only on small frames, labeled on larger */}
      <aside className="flex flex-col w-14 sm:w-48 lg:w-52 bg-[#050505] border-r border-white/5 relative shrink-0 transition-all duration-300">
        <div className="absolute inset-0 bg-mesh opacity-20 -z-10 pointer-events-none" />

        {/* Brand Header */}
        <div className="py-4 px-2 sm:px-5 border-b border-white/5 flex items-center gap-2.5 justify-center sm:justify-start">
          <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="Swapboard" fill className="object-contain" sizes="32px" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-black tracking-tight text-white block">SwapBoard</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-gold/70 block">Demo</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-1.5 sm:px-3 space-y-1 mt-3 overflow-y-auto no-scrollbar">
          {navItems.map(({ key, label, icon: Icon, badge }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "w-full flex items-center justify-center sm:justify-between px-2 sm:px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                  active
                    ? "bg-gold/10 text-gold shadow-sm shadow-gold/5 border border-gold/20"
                    : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                )}
                title={label}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4 shrink-0 transition-transform", active && "scale-110 text-gold")} />
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {Boolean(badge && badge > 0) && (
                  <span className="hidden sm:flex h-4 min-w-4 px-1.5 items-center justify-center rounded-full bg-gold text-[#050505] text-[9px] font-black">
                    {badge}
                  </span>
                )}
                {Boolean(badge && badge > 0) && (
                  <span className="sm:hidden absolute top-0 right-0 w-2 h-2 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Worker Session Footer */}
        <div className="p-2 sm:p-3 border-t border-white/5">
          <button
            onClick={() => setActiveTab("profile")}
            className="w-full rounded-xl p-2 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-center sm:justify-start gap-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-black border border-gold/20 shrink-0">
              {PROFILE.initial}
            </div>
            <div className="hidden sm:block flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate">{PROFILE.name}</p>
              <p className="text-[9px] text-white/30 font-medium truncate">{PROFILE.role}</p>
            </div>
          </button>
        </div>
      </aside>


      {/* Main Content Area — Fully Responsive & Scrollable */}
      <div className="flex-1 relative flex flex-col min-w-0 h-full overflow-hidden">
        {/* Scrollable Viewport with Smooth Scrolling */}
        <main className="flex-1 w-full px-3 sm:px-6 lg:px-7 py-4 sm:py-6 overflow-y-auto no-scrollbar">
          {activeTab === "home" && (
            <HomeView
              onNavigate={(tab) => setActiveTab(tab)}
              onPostSwap={() => {
                setActiveTab("swap");
                showToast("Opening shift swap market...");
              }}
              availableCount={4 - claimedShiftIds.length}
            />
          )}

          {activeTab === "shifts" && (
            <MyShiftsView
              filter={shiftsFilter}
              onFilterChange={setShiftsFilter}
              onSwapRequest={(title) => {
                setActiveTab("swap");
                showToast(`Initiated swap request for ${title}`);
              }}
            />
          )}

          {activeTab === "available" && (
            <AvailableShiftsView
              claimedIds={claimedShiftIds}
              onClaim={(id, title) => {
                setClaimedShiftIds([...claimedShiftIds, id]);
                showToast(`Claimed "${title}"! Sent to manager Dave for approval.`);
              }}
            />
          )}

          {activeTab === "swap" && (
            <SwapBoardView
              swaps={activeSwapList}
              onCancelSwap={(id) => {
                setActiveSwapList(activeSwapList.filter((s) => s.id !== id));
                showToast("Swap request cancelled.");
              }}
              onOpenPostModal={() => setShowPostSwapModal(true)}
            />
          )}

          {activeTab === "team" && <TeamView />}

          {activeTab === "profile" && <ProfileView onSaved={() => showToast("Profile preferences updated!")} />}
        </main>
      </div>

      {/* Post Shift for Swap Mock Modal */}
      {showPostSwapModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass rounded-[2rem] p-6 max-w-sm w-full border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-black text-white">Post Shift for Swap</h3>
              <button onClick={() => setShowPostSwapModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Select Shift</label>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-bold text-white">
                  Friday Dinner Floor (Jul 11 · 6 PM – 2 AM)
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-white/40 block mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  defaultValue="Need cover for personal appointment"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPostSwapModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/5 text-white/60 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPostSwapModal(false);
                  showToast("Swap posted to Harbor Kitchen team board!");
                }}
                className="flex-1 py-2 rounded-xl bg-gold text-black text-xs font-black"
              >
                Post Swap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 1. HOME VIEW
// -------------------------------------------------------------
function HomeView({
  onNavigate,
  onPostSwap,
  availableCount,
}: {
  onNavigate: (tab: TabType) => void;
  onPostSwap: () => void;
  availableCount: number;
}) {
  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/60">{ORG_NAME}</p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Good afternoon, Alex 👋</h1>
        <p className="text-xs text-white/40 font-medium">Here&apos;s what&apos;s happening with your shifts today.</p>
      </div>

      {/* Complete Profile Card */}
      <button
        onClick={() => onNavigate("profile")}
        className="w-full text-left glass rounded-2xl p-4 sm:p-5 border border-gold/20 relative overflow-hidden group hover:border-gold/40 transition-all block"
      >
        <div className="absolute right-0 top-0 w-36 h-36 bg-gold/5 blur-2xl rounded-full pointer-events-none" />
        <div className="flex items-start justify-between mb-3 relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-black text-gold uppercase tracking-widest">Complete Your Profile</span>
            </div>
            <p className="text-[11px] text-white/40 font-medium">Missing: Phone number, Emergency contact +2 more</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-gold">63%</span>
            <ChevronRight className="w-4 h-4 text-gold/50 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        <div className="flex gap-1 relative z-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn("h-1.5 flex-1 rounded-full", i < 5 ? "bg-gold" : "bg-white/10")}
            />
          ))}
        </div>
      </button>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onPostSwap}
          className="btn-gold rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 text-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#050505]/20 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4 text-[#050505]" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-[#050505] uppercase tracking-wider leading-tight">
            Post Shift for Swap
          </span>
        </button>

        <button
          onClick={() => onNavigate("available")}
          className="glass rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 border border-white/10 text-center relative hover:border-gold/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {availableCount > 0 && (
            <span className="absolute top-2.5 right-2.5 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-gold text-[#050505] text-[9px] font-black shadow-md shadow-gold/20">
              {availableCount}
            </span>
          )}
          <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-gold" strokeWidth={2} />
          </div>
          <span className="block text-[10px] sm:text-[11px] font-black text-gold uppercase tracking-wider leading-tight">
            Available Shifts
          </span>
        </button>
      </div>

      {/* Upcoming Shifts List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Upcoming Shifts</h2>
          <button
            onClick={() => onNavigate("shifts")}
            className="text-[10px] font-bold text-gold/70 hover:text-gold flex items-center gap-0.5"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          <div className="glass rounded-2xl p-3.5 sm:p-4 border border-white/5 hover:border-white/15 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-white truncate">Evening Floor & Dining</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold/60" /> Fri, Jul 11
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold/60" /> 6:00 PM – 2:00 AM
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Floor Team</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white/50 bg-white/10">
                Upcoming
              </span>
            </div>
          </div>

          <div className="glass rounded-2xl p-3.5 sm:p-4 border border-purple-500/20 bg-purple-500/[0.03] hover:border-purple-500/40 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-white truncate">Saturday Brunch Rush</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] font-medium text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold/60" /> Sat, Jul 12
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold/60" /> 10:00 AM – 6:00 PM
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider">Kitchen Support</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-500/30">
                Up for Swap
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Activity Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-gold/60" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Swap Activity</h2>
          </div>
          <button
            onClick={() => onNavigate("swap")}
            className="text-[10px] font-bold text-gold/70 hover:text-gold flex items-center gap-0.5"
          >
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="glass rounded-2xl p-3.5 border border-gold/15 bg-gold/[0.02] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">James K. offered to cover</p>
                <p className="text-[10px] text-white/40">Sat, Jul 12 · Awaiting manager Dave approval</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider shrink-0">In Review</span>
          </div>

          <div className="glass rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Friday Floor Shift Trade</p>
                <p className="text-[10px] text-white/40">Awaiting someone from Dining to claim</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider shrink-0">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. MY SHIFTS VIEW
// -------------------------------------------------------------
function MyShiftsView({
  filter,
  onFilterChange,
  onSwapRequest,
}: {
  filter: "all" | "upcoming" | "completed" | "swapped";
  onFilterChange: (f: "all" | "upcoming" | "completed" | "swapped") => void;
  onSwapRequest: (title: string) => void;
}) {
  const allShifts = [
    {
      id: "sh-1",
      title: "Evening Floor & Dining",
      date: "Fri, Jul 11",
      time: "6:00 PM – 2:00 AM",
      dept: "Floor",
      status: "upcoming",
      badge: "Upcoming",
      badgeColor: "bg-white/10 text-white/70",
    },
    {
      id: "sh-2",
      title: "Saturday Brunch Rush",
      date: "Sat, Jul 12",
      time: "10:00 AM – 6:00 PM",
      dept: "Kitchen",
      status: "upcoming",
      badge: "Up for Swap",
      badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    },
    {
      id: "sh-3",
      title: "Sunday Night Bar Close",
      date: "Sun, Jul 13",
      time: "4:00 PM – 12:00 AM",
      dept: "Bar",
      status: "upcoming",
      badge: "Upcoming",
      badgeColor: "bg-white/10 text-white/70",
    },
    {
      id: "sh-4",
      title: "Thursday Prep & Line",
      date: "Thu, Jul 10",
      time: "11:00 AM – 7:00 PM",
      dept: "Kitchen",
      status: "completed",
      badge: "Completed ✓",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    },
    {
      id: "sh-5",
      title: "Tuesday Midday Service",
      date: "Tue, Jul 08",
      time: "12:00 PM – 8:00 PM",
      dept: "Floor",
      status: "swapped",
      badge: "Swapped with Sarah M.",
      badgeColor: "bg-white/5 text-white/30 border border-white/5",
    },
  ];

  const filtered = allShifts.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">My Scheduled Shifts</h1>
          <p className="text-xs text-white/40">View your roster and request trades</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 max-w-sm">
        {(["all", "upcoming", "completed", "swapped"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onFilterChange(t)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
              filter === t ? "bg-gold text-black shadow-md shadow-gold/20" : "text-white/40 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-4 border border-white/5 hover:border-white/15 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gold/60" /> {s.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gold/60" /> {s.time}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-white/20">· {s.dept}</span>
                </div>
              </div>

              {s.status === "upcoming" && s.badge !== "Up for Swap" && (
                <button
                  onClick={() => onSwapRequest(s.title)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gold/15 hover:text-gold border border-white/5 hover:border-gold/30 text-[10px] font-bold text-white/60 transition-all self-start sm:self-auto flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Request Swap</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. AVAILABLE SHIFTS VIEW
// -------------------------------------------------------------
function AvailableShiftsView({
  claimedIds,
  onClaim,
}: {
  claimedIds: string[];
  onClaim: (id: string, title: string) => void;
}) {
  const availableShifts = [
    {
      id: "av-1",
      title: "Monday Dinner Rush",
      date: "Mon, Jul 14",
      time: "5:00 PM – 11:30 PM",
      dept: "Bar",
      offeredBy: "Marcus Taylor",
      rate: "$19.50/hr",
    },
    {
      id: "av-2",
      title: "Wednesday Lunch Service",
      date: "Wed, Jul 16",
      time: "11:00 AM – 4:00 PM",
      dept: "Floor",
      offeredBy: "General Open Shift",
      rate: "$19.50/hr",
    },
    {
      id: "av-3",
      title: "Friday Late Floor Closer",
      date: "Fri, Jul 18",
      time: "8:00 PM – 3:00 AM",
      dept: "Floor",
      offeredBy: "Chloe Davis",
      rate: "$19.50/hr",
    },
    {
      id: "av-4",
      title: "Saturday Morning Line Prep",
      date: "Sat, Jul 19",
      time: "8:00 AM – 3:00 PM",
      dept: "Kitchen",
      offeredBy: "David Ramos",
      rate: "$20.00/hr",
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Available Shifts & Open Coverage</h1>
        <p className="text-xs text-white/40">Claim shifts to pick up extra hours in Harbor Kitchen</p>
      </div>

      <div className="space-y-3">
        {availableShifts.map((sh) => {
          const isClaimed = claimedIds.includes(sh.id);

          return (
            <div
              key={sh.id}
              className={cn(
                "glass rounded-2xl p-4 border transition-all",
                isClaimed ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-white/5 hover:border-gold/25"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{sh.title}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
                      {sh.dept}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gold/60" /> {sh.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gold/60" /> {sh.time}
                    </span>
                    <span className="text-gold font-bold">{sh.rate}</span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">Offered by: {sh.offeredBy}</p>
                </div>

                <div>
                  {isClaimed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      <Check className="w-3.5 h-3.5" />
                      Claim Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => onClaim(sh.id, sh.title)}
                      className="px-4 py-2 rounded-xl bg-gold hover:bg-gold/90 text-black text-[11px] font-black uppercase tracking-wider shadow-md shadow-gold/20 transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>Claim Shift</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. SWAP BOARD VIEW
// -------------------------------------------------------------
function SwapBoardView({
  swaps,
  onCancelSwap,
  onOpenPostModal,
}: {
  swaps: any[];
  onCancelSwap: (id: string) => void;
  onOpenPostModal: () => void;
}) {
  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Shift Swap Board</h1>
          <p className="text-xs text-white/40">Active trades and shift swaps in Harbor Kitchen</p>
        </div>
        <button
          onClick={onOpenPostModal}
          className="px-3.5 py-2 rounded-xl bg-gold text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-gold/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Swap</span>
        </button>
      </div>

      <div className="space-y-3">
        {swaps.map((s) => (
          <div key={s.id} className="glass rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-xs text-white/40 mt-0.5">{s.date}</p>
                <p className="text-[11px] text-gold/80 font-medium mt-1">{s.message}</p>
              </div>

              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                  s.status === "worker_accepted"
                    ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                )}
              >
                {s.status === "worker_accepted" ? "Cover Found" : "Awaiting Cover"}
              </span>
            </div>

            {s.canCancel && (
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => onCancelSwap(s.id)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-300"
                >
                  Cancel Swap Request
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Informational card */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-1">
          <p className="text-xs font-bold text-white/60">Manager Approval Rules</p>
          <p className="text-[11px] text-white/30 max-w-sm mx-auto">
            Once a teammate agrees to take your shift, General Manager Dave receives an instant notification to approve the trade.
          </p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. TEAM VIEW
// -------------------------------------------------------------
function TeamView() {
  const team = [
    { name: "Dave Sterling", role: "General Manager", dept: "Management", onDuty: true, initial: "D" },
    { name: "Maria Santos", role: "Shift Supervisor", dept: "Floor Lead", onDuty: false, initial: "M" },
    { name: "Alex Rivera", role: "Floor & Bar Staff (You)", dept: "Floor", onDuty: true, initial: "A" },
    { name: "Sarah Miller", role: "Line Cook", dept: "Kitchen", onDuty: true, initial: "S" },
    { name: "Marcus Taylor", role: "Head Bartender", dept: "Bar", onDuty: false, initial: "M" },
    { name: "Chloe Davis", role: "Server", dept: "Floor", onDuty: true, initial: "C" },
    { name: "James Kelly", role: "Sous Chef", dept: "Kitchen", onDuty: false, initial: "J" },
  ];

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Harbor Kitchen Team</h1>
        <p className="text-xs text-white/40">Staff roster & live duty status</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {team.map((m) => (
          <div key={m.name} className="glass rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold border border-gold/20 flex items-center justify-center font-bold text-xs shrink-0">
                {m.initial}
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  {m.name}
                </p>
                <p className="text-[10px] text-white/40">{m.role} · {m.dept}</p>
              </div>
            </div>

            <div>
              {m.onDuty ? (
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  On Duty
                </div>
              ) : (
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Off</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. PROFILE VIEW
// -------------------------------------------------------------
function ProfileView({ onSaved }: { onSaved: () => void }) {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">Worker Profile</h1>
        <p className="text-xs text-white/40">Manage your contact, certifications, and notification alerts</p>
      </div>

      <div className="glass rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 text-gold flex items-center justify-center text-xl font-black">
            {PROFILE.initial}
          </div>
          <div>
            <h2 className="text-base font-black text-white">{PROFILE.name}</h2>
            <p className="text-xs text-white/40">{PROFILE.role} · {ORG_NAME}</p>
            <span className="inline-block mt-1 text-[9px] font-black uppercase text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/20">
              63% Profile Completed
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Email</span>
            <span className="font-mono text-white/80">{PROFILE.email}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Phone</span>
            <span className="font-mono text-white/80">{PROFILE.phone}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Hourly Base Rate</span>
            <span className="font-black text-gold">{PROFILE.hourlyRate} / hr</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/30 block mb-1">Timezone</span>
            <span className="text-white/80">{PROFILE.timezone}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Certifications & Badges</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> Smart Serve Certified
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" /> Food Handler Level 1
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notification Preferences</h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <span className="text-xs text-white/80">Shift Swap Notifications</span>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => {
                  setEmailNotifs(e.target.checked);
                  onSaved();
                }}
                className="rounded accent-amber-400"
              />
            </label>
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
              <span className="text-xs text-white/80">Manager Approval Alerts</span>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => {
                  setPushNotifs(e.target.checked);
                  onSaved();
                }}
                className="rounded accent-amber-400"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
