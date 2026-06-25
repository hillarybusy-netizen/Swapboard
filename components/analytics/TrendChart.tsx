"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendChartProps {
  data: Array<{ date: string; [key: string]: string | number }>;
  dataKeys: Array<{ key: string; label: string; color: string }>;
  title: string;
  height?: number;
}

export function TrendChart({ data, dataKeys, title, height = 300 }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-white/40">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="card-premium p-6 rounded-2xl">
      <h3 className="text-lg font-black mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" />
          <YAxis stroke="rgba(255,255,255,0.4)" />
          <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
          <Legend />
          {dataKeys.map((dk) => (
            <Line key={dk.key} type="monotone" dataKey={dk.key} stroke={dk.color} name={dk.label} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
