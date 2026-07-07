"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { LandingDraggableSwaps } from "@/components/landing/LandingDraggableSwaps";

const weeklyData = [
  { week: "W1", swaps: 12, filled: 10 },
  { week: "W2", swaps: 18, filled: 16 },
  { week: "W3", swaps: 24, filled: 22 },
  { week: "W4", swaps: 31, filled: 29 },
];

export function LandingHeroPreview() {
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto lg:mx-0"
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
    >
      {/* Ambient glow */}
      <div className="absolute -inset-6 sm:-inset-8 bg-gold/10 blur-3xl rounded-[3rem] -z-10 animate-pulse-glow" />

      <motion.div
        className="card-premium glass-shine rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-5 border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-float"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40 border border-red-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/20" />
          </div>
          <div className="flex-1 h-6 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center overflow-hidden">
            <span className="text-[8px] sm:text-[9px] font-bold text-white/20 tracking-widest uppercase truncate px-2">
              app.swapboard.io/dashboard
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* Chart panel */}
          <div className="sm:col-span-3 rounded-xl sm:rounded-2xl bg-[#0a0a0a] border border-white/5 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Swap fulfillment</p>
                <p className="text-xl sm:text-2xl font-black text-gold tabular-nums">94%</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Live</span>
              </div>
            </div>
            <div className="h-[120px] sm:h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 11 }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  />
                  <Area type="monotone" dataKey="filled" stroke="#d4af37" strokeWidth={2} fill="url(#goldFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Draggable swap queue */}
          <div className="sm:col-span-2 rounded-xl sm:rounded-2xl bg-[#0a0a0a] border border-white/5 p-3">
            <LandingDraggableSwaps />
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Saved this week", value: "$1,240" },
            { label: "Avg resolution", value: "2 min" },
            { label: "Coverage", value: "100%" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="rounded-xl bg-white/[0.02] border border-white/5 p-2 sm:p-2.5 text-center hover:border-gold/20 transition-colors"
            >
              <p className="text-xs sm:text-sm font-black text-white tabular-nums">{kpi.value}</p>
              <p className="text-[6px] sm:text-[7px] font-bold uppercase tracking-widest text-white/25 mt-0.5 leading-tight">{kpi.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
