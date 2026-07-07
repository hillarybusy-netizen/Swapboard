"use client";

import Image from "next/image";
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Cell,
} from "recharts";
import { Check, RefreshCw, Send } from "lucide-react";
import { LANDING_IMAGES } from "@/lib/landing-images";

const fulfillmentData = [
  { month: "Jan", rate: 72 },
  { month: "Feb", rate: 81 },
  { month: "Mar", rate: 88 },
  { month: "Apr", rate: 94 },
];

const coverageFeed = [
  { team: "Floor", location: "Downtown", swaps: 8, active: true },
  { team: "Kitchen", location: "Midtown", swaps: 5, active: true },
  { team: "ER Night", location: "North Wing", swaps: 12, active: true },
];

function ImageLabel({ text }: { text: string }) {
  return (
    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-[#050505]/75 backdrop-blur-md border border-white/10">
      <p className="text-[8px] font-black uppercase tracking-widest text-gold">{text}</p>
    </div>
  );
}

export function LandingCoverageVisual() {
  const img = LANDING_IMAGES.showcase.coverage;
  return (
    <div className="h-44 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden relative shadow-inner">
      <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="400px" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/50 to-[#0a0a0a]/25" />
      <ImageLabel text={img.label} />
      <div className="absolute inset-0 p-3 flex flex-col justify-end gap-1.5">
        {coverageFeed.map((item) => (
          <div key={item.team} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#050505]/70 backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold text-white truncate">{item.team}</span>
              <span className="text-[8px] text-white/30 font-medium hidden sm:inline">· {item.location}</span>
            </div>
            <span className="text-[9px] font-black text-gold tabular-nums shrink-0">{item.swaps} swaps</span>
          </div>
        ))}
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#050505]/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">94% Active Swap Rates</span>
      </div>
    </div>
  );
}

export function LandingVerificationVisual() {
  const img = LANDING_IMAGES.showcase.verification;
  const requests = [
    { icon: Send, label: "Send Request", active: true },
    { icon: RefreshCw, label: "Swap Shift", active: false },
    { icon: Check, label: "Verify Cert", active: true },
  ];

  return (
    <div className="h-44 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden shadow-inner relative">
      <Image src={img.src} alt={img.alt} fill className="object-cover object-top" sizes="400px" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/92 via-[#0a0a0a]/75 to-[#0a0a0a]/55" />
      <ImageLabel text={img.label} />
      <div className="relative h-full p-4 flex flex-col justify-between">
        <div className="space-y-2 mt-8">
          {requests.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                active
                  ? "bg-gold/10 border-gold/25"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                active ? "bg-gold/20" : "bg-white/5"
              }`}>
                <Icon className={`w-3.5 h-3.5 ${active ? "text-gold" : "text-white/30"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{label}</p>
                {active && <p className="text-[8px] text-emerald-400 font-bold mt-0.5">Verified · No conflicts</p>}
              </div>
              {active && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-2">
          <div className="flex -space-x-2">
            {["RN", "LPN", "CNA"].map((role, i) => (
              <div key={role} className="w-6 h-6 rounded-full border-2 border-[#0a0a0a] bg-gold/15 flex items-center justify-center text-[7px] font-black text-gold" style={{ zIndex: 3 - i }}>
                {role}
              </div>
            ))}
          </div>
          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Roles verified before swap</span>
        </div>
      </div>
    </div>
  );
}

export function LandingAnalyticsVisual() {
  const img = LANDING_IMAGES.showcase.analytics;
  return (
    <div className="h-44 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 p-4 shadow-inner relative overflow-hidden">
      <Image src={img.src} alt={img.alt} fill className="object-cover opacity-30" sizes="400px" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/55" />
      <ImageLabel text={img.label} />
      <div className="relative flex items-start justify-between mb-2">
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Fulfillment Ascend</p>
          <p className="text-lg font-black text-gold tabular-nums">+22%</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold text-white/25 uppercase tracking-widest">This quarter</p>
          <p className="text-[10px] font-black text-emerald-400">↑ 94% peak</p>
        </div>
      </div>
      <div className="relative h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fulfillmentData} margin={{ top: 8, right: 4, left: -30, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {fulfillmentData.map((entry, i) => (
                <Cell
                  key={entry.month}
                  fill={`rgba(212, 175, 55, ${0.25 + i * 0.2})`}
                  stroke={`rgba(212, 175, 55, ${0.4 + i * 0.15})`}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
        {fulfillmentData.map((d) => (
          <span key={d.month} className={d.rate === 94 ? "text-gold" : ""}>{d.rate}%</span>
        ))}
      </div>
    </div>
  );
}
