import type { SwapRequest } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils";

// ROI constants (industry averages)
const OVERTIME_PREMIUM_PER_HOUR = 15; // avg $ saved per shift hour by avoiding overtime/agency
const MANAGER_MINS_PER_SWAP = 30; // avg minutes manager spends coordinating a swap manually
const AVG_SHIFT_HOURS = 8;

export interface ROIMetrics {
  totalSwapsRequested: number;
  totalSwapsFulfilled: number;
  fulfillmentRate: number; // 0–100
  costSavings: number; // $
  managerHoursSaved: number;
  activeSwaps: number;
  avgFulfillmentHours: number | null;
}

export interface WeeklySwapData {
  week: string;
  requested: number;
  fulfilled: number;
  rate: number;
}

export function calculateROI(swaps: SwapRequest[]): ROIMetrics {
  const total = swaps.length;
  const fulfilled = swaps.filter((s) => s.status === "manager_approved").length;
  const active = swaps.filter((s) => s.status === "pending" || s.status === "worker_accepted").length;

  const fulfillmentRate = total > 0 ? Math.round((fulfilled / total) * 100) : 0;
  const costSavings = fulfilled * AVG_SHIFT_HOURS * OVERTIME_PREMIUM_PER_HOUR;
  const managerHoursSaved = (fulfilled * MANAGER_MINS_PER_SWAP) / 60;

  // Average hours to fulfill (from requested_at to manager_responded_at)
  const fulfilledWithTimes = swaps.filter(
    (s) => s.status === "manager_approved" && s.manager_responded_at
  );
  const avgFulfillmentHours =
    fulfilledWithTimes.length > 0
      ? fulfilledWithTimes.reduce((acc, s) => {
          const diff =
            (new Date(s.manager_responded_at!).getTime() -
              new Date(s.requested_at).getTime()) /
            (1000 * 60 * 60);
          return acc + diff;
        }, 0) / fulfilledWithTimes.length
      : null;

  return {
    totalSwapsRequested: total,
    totalSwapsFulfilled: fulfilled,
    fulfillmentRate,
    costSavings,
    managerHoursSaved,
    activeSwaps: active,
    avgFulfillmentHours,
  };
}

export function formatROIMetrics(metrics: ROIMetrics) {
  return {
    fulfillmentRate: `${metrics.fulfillmentRate}%`,
    costSavings: formatCurrency(metrics.costSavings),
    managerHoursSaved: `${metrics.managerHoursSaved.toFixed(1)}h`,
    activeSwaps: metrics.activeSwaps.toString(),
  };
}

export function groupSwapsByWeek(swaps: SwapRequest[]): WeeklySwapData[] {
  const now = new Date();
  const weeks: WeeklySwapData[] = [];

  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7 - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekSwaps = swaps.filter((s) => {
      const d = new Date(s.created_at);
      return d >= weekStart && d < weekEnd;
    });

    const requested = weekSwaps.length;
    const fulfilled = weekSwaps.filter((s) => s.status === "manager_approved").length;

    weeks.push({
      week: `Week ${4 - i}`,
      requested,
      fulfilled,
      rate: requested > 0 ? Math.round((fulfilled / requested) * 100) : 0,
    });
  }

  return weeks;
}
