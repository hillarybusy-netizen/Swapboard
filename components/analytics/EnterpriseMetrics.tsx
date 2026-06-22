"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, TrendingDown, Clock } from "lucide-react";

interface EnterpriseMetricsProps {
  workerEngagementScore: number;
  shiftCoverageRate: number;
  predictedBusyTimes: string[];
  overtimeAvoided: number;
  cancellationRate: number;
  avgFulfillmentTime: number | null;
}

export function EnterpriseMetrics({
  workerEngagementScore,
  shiftCoverageRate,
  predictedBusyTimes,
  overtimeAvoided,
  cancellationRate,
  avgFulfillmentTime,
}: EnterpriseMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Engagement Score */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Worker Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20">
              <span className="text-2xl font-black text-emerald-400">{workerEngagementScore}%</span>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold">Score</p>
              <p className="text-xs text-white/60">Based on swap participation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Rate */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Shift Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20">
              <span className="text-2xl font-black text-blue-400">{shiftCoverageRate}%</span>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold">Rate</p>
              <p className="text-xs text-white/60">Swaps with coverage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Avoided */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Overtime Avoided</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-yellow-400/60" />
            <div>
              <p className="text-2xl font-black">{overtimeAvoided.toFixed(1)}h</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Shift hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Busy Times */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {predictedBusyTimes.length > 0 ? (
              predictedBusyTimes.map((time) => (
                <div key={time} className="text-sm font-bold text-gold/60">
                  {time}
                </div>
              ))
            ) : (
              <p className="text-[10px] text-white/40">No peak times data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Rate */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Cancellation Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <TrendingDown className="w-8 h-8 text-red-400/60" />
            <div>
              <p className="text-2xl font-black">{cancellationRate}%</p>
              <p className="text-[10px] text-white/40 uppercase font-bold">Of requests</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avg Fulfillment Time */}
      {avgFulfillmentTime !== null && (
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Avg Fulfillment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-purple-400/60" />
              <div>
                <p className="text-2xl font-black">{avgFulfillmentTime.toFixed(1)}h</p>
                <p className="text-[10px] text-white/40 uppercase font-bold">To approve</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
