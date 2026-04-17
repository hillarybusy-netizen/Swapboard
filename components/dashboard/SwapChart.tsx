"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { WeeklySwapData } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/skeleton";

export function SwapChart({ data }: { data: WeeklySwapData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="h-[200px] w-full rounded-lg" />;
  }

  if (!data || data.every((d) => d.requested === 0)) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No swap data yet — data will appear once swaps are created.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(v: number, name: string) => [v, name === "requested" ? "Requested" : "Fulfilled"]}
        />
        <Legend formatter={(v) => (v === "requested" ? "Requested" : "Fulfilled")} wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="requested" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="fulfilled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
