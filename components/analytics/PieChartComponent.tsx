"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface PieChartComponentProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  colors?: string[];
}

const DEFAULT_COLORS = ["#fbbf24", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

export function PieChartComponent({ data, title, colors = DEFAULT_COLORS }: PieChartComponentProps) {
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
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toString()} contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
