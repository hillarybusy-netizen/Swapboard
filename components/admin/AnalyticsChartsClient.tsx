"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function AnalyticsChartsClient({ planDistribution = [], orgStats = [], analytics = {} }: any) {
  const COLORS = ["#ff6b6b", "#4c6ef5", "#15aabf", "#ffd43b"];

  return (
    <>
      {planDistribution.length > 0 && (
        <div className="w-full">
          <div className="glass rounded-[1rem] p-4 bg-white/[0.02] border-white/10">
            <h3 className="text-sm font-bold mb-2">Plan Distribution</h3>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                    {planDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Organizations bar chart */}
      {orgStats.length > 0 && (
        <div className="w-full mt-6">
          <div className="glass rounded-[1rem] p-4 bg-white/[0.02] border-white/10">
            <h3 className="text-sm font-bold mb-2">Top Organizations</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orgStats.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="totalSwaps" fill="#ffd43b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
