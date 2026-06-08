"use client";
import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const weeklyData = [
  { week: "W1", swaps: 12, filled: 10 },
  { week: "W2", swaps: 18, filled: 16 },
  { week: "W3", swaps: 24, filled: 22 },
  { week: "W4", swaps: 31, filled: 29 },
];

const pendingSwaps = [
  { name: "Sarah M.", shift: "Fri 6pm–2am", dept: "Floor", status: "pending" },
  { name: "James K.", shift: "Sat 10am–6pm", dept: "Kitchen", status: "accepted" },
  { name: "Priya L.", shift: "Sun 2pm–10pm", dept: "Bar", status: "approved" },
];

export function LandingHeroPreview() {
  return (
    <div className="relative w-full max-w-2xl mx-auto lg:mx-0">
      <div className="absolute -inset-4 bg-gold/10 blur-3xl rounded-[3rem] -z-10" />
      <div className="card-premium rounded-[2rem] p-4 md:p-5 border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 h-6 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white/20 tracking-widest uppercase">app.swapboard.io/dashboard</span>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          {/* Chart panel */}
          <div className="md:col-span-3 rounded-2xl bg-[#0a0a0a] border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Swap fulfillment</p>
                <p className="text-2xl font-black text-gold tabular-nums">94%</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Live</span>
              </div>
            </div>
            <div className="h-[140px] w-full">
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

          {/* Swap queue */}
          <div className="md:col-span-2 rounded-2xl bg-[#0a0a0a] border border-white/5 p-3 flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 px-1 mb-1">Active queue</p>
            {pendingSwaps.map((swap) => (
              <div key={swap.name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-[10px] font-black text-gold shrink-0">
                  {swap.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-white truncate">{swap.name}</p>
                  <p className="text-[8px] text-white/30 font-medium truncate">{swap.shift}</p>
                </div>
                <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 ${
                  swap.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                  swap.status === "accepted" ? "bg-gold/15 text-gold" :
                  "bg-white/5 text-white/40"
                }`}>
                  {swap.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Saved this week", value: "$1,240" },
            { label: "Avg resolution", value: "2 min" },
            { label: "Coverage", value: "100%" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5 text-center">
              <p className="text-sm font-black text-white tabular-nums">{kpi.value}</p>
              <p className="text-[7px] font-bold uppercase tracking-widest text-white/25 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating photo accent */}
      <div className="absolute -bottom-6 -left-6 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
        <Image
          src="/landing/restaurant-team.jpg"
          alt="Restaurant team coordinating shifts"
          fill
          className="object-cover"
          sizes="144px"
        />
      </div>
    </div>
  );
}
