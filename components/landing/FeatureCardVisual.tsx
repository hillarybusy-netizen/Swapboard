"use client";

import Image from "next/image";
import {
  AreaChart, Area, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { RefreshCw, Clock, BarChart3, Users, Shield, TrendingUp } from "lucide-react";
import { LANDING_IMAGES } from "@/lib/landing-images";

const ICON_MAP: Record<string, LucideIcon> = {
  RefreshCw, Clock, BarChart3, Users, Shield, TrendingUp,
};

const roiData = [
  { w: "W1", saved: 800 },
  { w: "W2", saved: 1200 },
  { w: "W3", saved: 2100 },
  { w: "W4", saved: 4200 },
];

const trialData = [
  { day: "D1", pct: 20 },
  { day: "D7", pct: 55 },
  { day: "D14", pct: 92 },
];

function ImageLabel({ text }: { text: string }) {
  return (
    <div className="absolute top-2.5 left-2.5 z-10 px-2 py-1 rounded-lg bg-[#050505]/75 backdrop-blur-md border border-white/10">
      <p className="text-[8px] font-black uppercase tracking-widest text-gold">{text}</p>
    </div>
  );
}

interface FeatureCardVisualProps {
  iconName: string;
}

export function FeatureCardVisual({ iconName }: FeatureCardVisualProps) {
  const Icon = ICON_MAP[iconName] ?? RefreshCw;
  const img = LANDING_IMAGES.features[iconName as keyof typeof LANDING_IMAGES.features];

  if (iconName === "RefreshCw" && img) {
    return (
      <div className="h-36 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden relative mb-6 group-hover:border-white/10 transition-colors">
        <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/35 to-[#0a0a0a]/20" />
        <ImageLabel text={img.label} />
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
          {["Sarah requested Fri 6pm cover", "James accepted · pending approval"].map((msg) => (
            <div key={msg} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#050505]/80 backdrop-blur-md border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 text-gold" />
              </div>
              <p className="text-[9px] font-bold text-white/80 truncate">{msg}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (iconName === "Clock" && img) {
    return (
      <div className="h-36 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden relative mb-6">
        <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/50 to-[#0a0a0a]/25" />
        <ImageLabel text={img.label} />
        <div className="absolute inset-0 p-4 flex flex-col justify-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Pending approval</p>
              <p className="text-sm font-bold text-white">Kitchen · Sat 10am</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Approve</p>
            </div>
            <div className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Decline</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (iconName === "BarChart3" && img) {
    return (
      <div className="h-36 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 p-3 mb-6 relative overflow-hidden">
        <Image src={img.src} alt={img.alt} fill className="object-cover opacity-35" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/75 to-[#0a0a0a]/40" />
        <ImageLabel text={img.label} />
        <div className="relative flex items-center justify-between mb-1 px-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Weekly savings</p>
          <p className="text-sm font-black text-gold tabular-nums">$4,200</p>
        </div>
        <div className="relative h-[88px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roiData} margin={{ top: 4, right: 0, left: -35, bottom: 0 }}>
              <defs>
                <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="saved" stroke="#d4af37" strokeWidth={2} fill="url(#roiFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (iconName === "Users") {
    return (
      <div className="h-36 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden mb-6 relative">
        <Image src={LANDING_IMAGES.features.Users.src} alt={LANDING_IMAGES.features.Users.alt} fill className="object-cover" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/95 via-[#0a0a0a]/50 to-[#0a0a0a]/30" />
        <ImageLabel text={LANDING_IMAGES.features.Users.label} />
        <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
          {["Restaurant", "Healthcare", "Retail"].map((dept) => (
            <div key={dept} className="px-2 py-1.5 rounded-lg bg-[#050505]/70 backdrop-blur-md border border-white/10 text-center">
              <p className="text-[7px] font-black uppercase tracking-widest text-white/70">{dept}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (iconName === "Shield" && img) {
    return (
      <div className="h-36 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 p-4 mb-6 relative overflow-hidden">
        <Image src={img.src} alt={img.alt} fill className="object-cover opacity-40" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-[#0a0a0a]/60" />
        <ImageLabel text={img.label} />
        <div className="relative space-y-2">
          {[
            { action: "Swap approved", user: "M. Chen → J. Park", time: "2m ago" },
            { action: "Cert verified", user: "Food Safety L2", time: "14m ago" },
            { action: "Audit logged", user: "Shift #4821", time: "1h ago" },
          ].map((log) => (
            <div key={log.action} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.03] border border-white/5">
              <Shield className="w-3 h-3 text-gold shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-white/70 truncate">{log.action} · {log.user}</p>
              </div>
              <span className="text-[7px] text-white/25 font-bold shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (iconName === "TrendingUp" && img) {
    return (
      <div className="h-36 w-full rounded-2xl bg-[#0a0a0a] border border-white/5 p-3 mb-6 relative overflow-hidden">
        <Image src={img.src} alt={img.alt} fill className="object-cover opacity-35" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/45" />
        <ImageLabel text={img.label} />
        <div className="relative flex items-center justify-between mb-2 px-1">
          <p className="text-[8px] font-black uppercase tracking-widest text-white/30">14-day trial progress</p>
          <p className="text-[10px] font-black text-emerald-400">92%</p>
        </div>
        <div className="relative h-[72px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trialData} margin={{ top: 4, right: 0, left: -35, bottom: 0 }}>
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {trialData.map((_, i) => (
                  <Cell key={i} fill={`rgba(212, 175, 55, ${0.3 + i * 0.25})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-gold/60 to-gold" />
        </div>
      </div>
    );
  }

  return null;
}
