"use client";

import {
  BarChart, Bar, XAxis, ResponsiveContainer, Cell,
} from "recharts";
import { Check, ShieldCheck, Zap, Activity } from "lucide-react";

const fulfillmentData = [
  { month: "Jan", rate: 72 },
  { month: "Feb", rate: 81 },
  { month: "Mar", rate: 88 },
  { month: "Apr", rate: 94 },
];

const coverageFeed = [
  { team: "Floor", location: "Downtown", swaps: 8, color: "bg-amber-400" },
  { team: "Kitchen", location: "Midtown", swaps: 5, color: "bg-gold" },
  { team: "ER Night", location: "North Wing", swaps: 12, color: "bg-emerald-400" },
];

export function LandingCoverageVisual() {
  return (
    <div className="h-44 w-full rounded-2xl bg-gradient-to-b from-[#121216] to-[#09090b] border border-white/10 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />

      {/* Header Bar */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Live Shift Board</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400">94% Active Swaps</span>
        </div>
      </div>

      {/* Shift Feed Items */}
      <div className="space-y-1.5 relative z-10">
        {coverageFeed.map((item) => (
          <div
            key={item.team}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full ${item.color} shrink-0`} />
              <span className="text-[11px] font-bold text-white tracking-tight truncate">{item.team}</span>
              <span className="text-[9px] text-white/30 font-medium hidden sm:inline">· {item.location}</span>
            </div>
            <span className="text-[10px] font-black text-gold tabular-nums shrink-0">{item.swaps} swaps</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingVerificationVisual() {
  const requests = [
    { label: "Role Eligibility", status: "Verified · No conflicts", active: true },
    { label: "Shift Overlap Check", status: "Clean · 0 Overlaps", active: true },
    { label: "Rest-Period Rule", status: "Compliant · 11h gap", active: true },
  ];

  return (
    <div className="h-44 w-full rounded-2xl bg-gradient-to-b from-[#121216] to-[#09090b] border border-white/10 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-gold/10 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/15 transition-all" />

      {/* Header Bar */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-gold" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Automated Verification</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Auto Passed
        </span>
      </div>

      {/* Verification Items */}
      <div className="space-y-1.5 relative z-10">
        {requests.map(({ label, status }) => (
          <div
            key={label}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gold/[0.04] border border-gold/15"
          >
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/90">{label}</p>
              <p className="text-[8px] text-emerald-400 font-bold">{status}</p>
            </div>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Role Badges */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-1">
          {["RN", "LPN", "CNA", "Barista"].map((role) => (
            <span
              key={role}
              className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] font-black text-white/60 uppercase"
            >
              {role}
            </span>
          ))}
        </div>
        <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Zero Violations</span>
      </div>
    </div>
  );
}

export function LandingAnalyticsVisual() {
  return (
    <div className="h-44 w-full rounded-2xl bg-gradient-to-b from-[#121216] to-[#09090b] border border-white/10 p-3.5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
      {/* Subtle ambient lighting */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/15 transition-all" />

      {/* Header Metric */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-gold" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Fulfillment Ascend</span>
          </div>
          <p className="text-xl font-black text-gold tabular-nums mt-0.5">+22%</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">This quarter</p>
          <p className="text-[10px] font-black text-emerald-400">↑ 94% peak</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[80px] w-full z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fulfillmentData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
            <Bar dataKey="rate" radius={[5, 5, 0, 0]} maxBarSize={30}>
              {fulfillmentData.map((entry, i) => (
                <Cell
                  key={entry.month}
                  fill={`rgba(212, 175, 55, ${0.3 + i * 0.22})`}
                  stroke={`rgba(212, 175, 55, ${0.5 + i * 0.15})`}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Values */}
      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30 border-t border-white/5 pt-1 relative z-10">
        {fulfillmentData.map((d) => (
          <span key={d.month} className={d.rate === 94 ? "text-gold font-black" : ""}>{d.rate}%</span>
        ))}
      </div>
    </div>
  );
}
