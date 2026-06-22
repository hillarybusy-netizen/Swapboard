"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface DepartmentPerformanceProps {
  departments: Array<{
    deptId: string;
    name: string;
    fulfillmentRate: number;
    avgTime: number;
    activeSwaps: number;
  }>;
}

export function DepartmentPerformance({ departments }: DepartmentPerformanceProps) {
  if (!departments.length) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-black">Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/50">No department data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-black">Department Performance</CardTitle>
            <CardDescription>Performance by department</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.deptId} className="flex flex-col gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-sm">{dept.name}</p>
                <p className="text-[10px] text-white/40 uppercase font-bold">Fulfillment Rate</p>
              </div>
              <p className="text-2xl font-black text-emerald-400">{dept.fulfillmentRate}%</p>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1">
              <div
                className="bg-emerald-500/60 h-1 rounded-full transition-all"
                style={{ width: `${dept.fulfillmentRate}%` }}
              />
            </div>
            <div className="flex gap-6 text-[10px] text-white/40 font-bold uppercase">
              <span>Avg Time: {dept.avgTime.toFixed(1)}h</span>
              <span>Active: {dept.activeSwaps}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
