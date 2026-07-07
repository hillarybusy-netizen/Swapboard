"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
} from "recharts";
import { ArrowRightLeft, Check, Clock } from "lucide-react";

const weeklyData = [
  { week: "W1", filled: 10 },
  { week: "W2", filled: 16 },
  { week: "W3", filled: 22 },
  { week: "W4", filled: 29 },
];

const WEEK_SHIFTS = [
  { day: "Mon", shifts: 2, covered: true },
  { day: "Tue", shifts: 3, covered: true },
  { day: "Wed", shifts: 2, covered: false },
  { day: "Thu", shifts: 4, covered: true },
  { day: "Fri", shifts: 3, covered: true },
  { day: "Sat", shifts: 2, covered: true },
  { day: "Sun", shifts: 1, covered: true },
];

const SWAP_QUEUE = [
  { name: "Sarah M.", shift: "Fri 6pm–2am", dept: "Floor", status: "pending" as const },
  { name: "James K.", shift: "Sat 10am–6pm", dept: "Kitchen", status: "accepted" as const },
  { name: "Priya L.", shift: "Sun 2pm–10pm", dept: "Bar", status: "approved" as const },
];

const STATUS_STYLE = {
  pending: "bg-white/5 text-white/40 border-white/10",
  accepted: "bg-gold/15 text-gold border-gold/25",
  approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

export function LandingHeroPreview() {
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto lg:mx-0"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -inset-4 sm:-inset-6 bg-gold/8 blur-3xl rounded-[3rem] -z-10" />

      <div className="card-premium glass-shine rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-5 border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 h-6 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden">
            <span className="text-[8px] sm:text-[9px] font-bold text-white/20 tracking-widest uppercase truncate px-2">
              app.swapboard.io/dashboard
            </span>
          </div>
        </div>

        {/* Fulfillment chart */}
        <div className="rounded-xl sm:rounded-2xl bg-[#0a0a0a] border border-white/5 p-3 sm:p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Swap fulfillment</p>
              <p className="text-xl sm:text-2xl font-black text-gold tabular-nums">94%</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Live</span>
            </div>
          </div>
          <div className="h-[100px] sm:h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroGoldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4af37" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                <Area type="monotone" dataKey="filled" stroke="#d4af37" strokeWidth={2} fill="url(#heroGoldFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Week coverage */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0a0a0a] border border-white/5 p-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">This week</p>
              <span className="text-[8px] font-bold text-emerald-400">6/7 covered</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {WEEK_SHIFTS.map((d) => (
                <div key={d.day} className="flex flex-col items-center gap-1">
                  <span className="text-[7px] font-bold text-white/25">{d.day}</span>
                  <div
                    className={`w-full aspect-square rounded-md flex items-center justify-center text-[8px] font-black tabular-nums border ${
                      d.covered
                        ? "bg-gold/15 border-gold/25 text-gold"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {d.shifts}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Swap queue */}
          <div className="rounded-xl sm:rounded-2xl bg-[#0a0a0a] border border-white/5 p-3">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRightLeft className="w-3 h-3 text-gold/60" />
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Active swaps</p>
            </div>
            <div className="space-y-1.5">
              {SWAP_QUEUE.map((swap) => (
                <div
                  key={swap.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-[9px] font-black text-gold shrink-0">
                    {swap.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{swap.name}</p>
                    <p className="text-[8px] text-white/30 truncate">{swap.shift}</p>
                  </div>
                  <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 ${STATUS_STYLE[swap.status]}`}>
                    {swap.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Saved this week", value: "$1,240", icon: null },
            { label: "Avg resolution", value: "2 min", icon: Clock },
            { label: "Coverage", value: "100%", icon: Check },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 text-center"
            >
              {kpi.icon && <kpi.icon className="w-3 h-3 text-gold/50 mx-auto mb-0.5" />}
              <p className="text-xs sm:text-sm font-black text-white tabular-nums">{kpi.value}</p>
              <p className="text-[6px] sm:text-[7px] font-bold uppercase tracking-widest text-white/25 mt-0.5 leading-tight">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
