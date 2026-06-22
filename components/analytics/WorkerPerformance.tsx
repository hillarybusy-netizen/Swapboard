"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface WorkerPerformanceProps {
  workers: Array<{
    id: string;
    name: string;
    swaps: number;
  }>;
}

export function WorkerPerformance({ workers }: WorkerPerformanceProps) {
  if (!workers.length) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-black">Top Workers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/50">No worker data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxSwaps = Math.max(...workers.map(w => w.swaps));

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-black">Top Workers</CardTitle>
            <CardDescription>Most active swap covers</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workers.map((worker, idx) => (
          <div key={worker.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-black">
              #{idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{worker.name}</p>
              <p className="text-[10px] text-white/40">{worker.swaps} swaps covered</p>
            </div>
            <div className="w-12 h-2 bg-white/5 rounded-full">
              <div
                className="bg-blue-500/60 h-2 rounded-full transition-all"
                style={{ width: `${(worker.swaps / maxSwaps) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
