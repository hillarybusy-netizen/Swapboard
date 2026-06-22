import type { SwapRequest, Shift } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils";

export interface BasicAnalytics {
  totalSwaps: number;
  fulfillmentRate: number;
  activeSwaps: number;
}

export interface AdvancedAnalytics extends BasicAnalytics {
  costSavings: number;
  managerHoursSaved: number;
  avgFulfillmentTime: number | null;
  swapsByDepartment: Record<string, number>;
  topWorkers: Array<{ id: string; name: string; swaps: number }>;
  cancellationRate: number;
  overtimeAvoided: number;
}

export interface EnterpriseAnalytics extends AdvancedAnalytics {
  workerEngagementScore: number;
  departmentPerformance: Array<{
    deptId: string;
    name: string;
    fulfillmentRate: number;
    avgTime: number;
    activeSwaps: number;
  }>;
  peakHours: Array<{ hour: number; swaps: number }>;
  shiftCoverageRate: number;
  swapReasons: Record<string, number>;
  managerWorkload: Array<{ managerId: string; swaps: number }>;
  predictedBusyTimes: string[];
}

function calculateShiftHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

export function calculateBasicAnalytics(swaps: any[]): BasicAnalytics {
  const total = swaps.length;
  const approved = swaps.filter(s => s.status === "manager_approved").length;
  const active = swaps.filter(s => s.status === "pending" || s.status === "worker_accepted").length;

  return {
    totalSwaps: total,
    fulfillmentRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    activeSwaps: active,
  };
}

export function calculateAdvancedAnalytics(
  swaps: any[],
  profiles: Record<string, any>
): AdvancedAnalytics {
  const basic = calculateBasicAnalytics(swaps);
  const approved = swaps.filter(s => s.status === "manager_approved");
  const cancelled = swaps.filter(s => s.status === "cancelled").length;

  // Cost savings (actual shift duration)
  const costSavings = approved.reduce((sum, swap) => {
    if (swap.shift?.start_time && swap.shift?.end_time) {
      const hours = calculateShiftHours(swap.shift.start_time, swap.shift.end_time);
      return sum + (hours * 15); // $15/hour savings
    }
    return sum;
  }, 0);

  // Manager time saved
  const managerHoursSaved = (approved.length * 30) / 60;

  // Average fulfillment time
  const fulfilledWithTimes = approved.filter(s => s.manager_responded_at);
  const avgFulfillmentTime = fulfilledWithTimes.length > 0
    ? fulfilledWithTimes.reduce((acc, s) => {
        const diff = (new Date(s.manager_responded_at!).getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60);
        return acc + diff;
      }, 0) / fulfilledWithTimes.length
    : null;

  // Swaps by department
  const swapsByDepartment: Record<string, number> = {};
  swaps.forEach(swap => {
    const deptId = swap.shift?.department_id || "unknown";
    swapsByDepartment[deptId] = (swapsByDepartment[deptId] || 0) + 1;
  });

  // Top workers (by swap coverage)
  const workerSwaps: Record<string, { count: number; name: string }> = {};
  swaps.forEach(swap => {
    if (swap.covering_worker_id) {
      const workerId = swap.covering_worker_id;
      workerSwaps[workerId] = {
        count: (workerSwaps[workerId]?.count || 0) + 1,
        name: swap.covering_worker?.full_name || "Unknown",
      };
    }
  });

  const topWorkers = Object.entries(workerSwaps)
    .map(([id, data]) => ({ id, name: data.name, swaps: data.count }))
    .sort((a, b) => b.swaps - a.swaps)
    .slice(0, 5);

  // Cancellation rate
  const cancellationRate = swaps.length > 0 ? Math.round((cancelled / swaps.length) * 100) : 0;

  // Overtime avoided
  const overtimeAvoided = approved.reduce((sum, swap) => {
    if (swap.shift?.start_time && swap.shift?.end_time) {
      const hours = calculateShiftHours(swap.shift.start_time, swap.shift.end_time);
      return sum + hours;
    }
    return sum;
  }, 0);

  return {
    ...basic,
    costSavings,
    managerHoursSaved,
    avgFulfillmentTime,
    swapsByDepartment,
    topWorkers,
    cancellationRate,
    overtimeAvoided,
  };
}

export function calculateEnterpriseAnalytics(
  swaps: any[],
  profiles: Record<string, any>,
  shifts: any[]
): EnterpriseAnalytics {
  const advanced = calculateAdvancedAnalytics(swaps, profiles);

  // Worker engagement score (0-100)
  const totalWorkerActions = swaps.filter(s => s.covering_worker_id).length;
  const successfulSwaps = swaps.filter(s => s.status === "manager_approved" && s.covering_worker_id).length;
  const workerEngagementScore = totalWorkerActions > 0 ? Math.round((successfulSwaps / totalWorkerActions) * 100) : 0;

  // Department performance
  const departmentPerf: Record<string, any> = {};
  swaps.forEach(swap => {
    const deptId = swap.shift?.department_id || "unknown";
    if (!departmentPerf[deptId]) {
      departmentPerf[deptId] = {
        total: 0,
        approved: 0,
        times: [],
        active: 0,
      };
    }
    departmentPerf[deptId].total += 1;
    if (swap.status === "manager_approved") departmentPerf[deptId].approved += 1;
    if (swap.status === "pending" || swap.status === "worker_accepted") departmentPerf[deptId].active += 1;
    if (swap.manager_responded_at && swap.created_at) {
      const time = (new Date(swap.manager_responded_at).getTime() - new Date(swap.created_at).getTime()) / (1000 * 60 * 60);
      departmentPerf[deptId].times.push(time);
    }
  });

  const departmentPerformance = Object.entries(departmentPerf)
    .map(([deptId, data]) => ({
      deptId,
      name: `Department ${deptId.slice(0, 8)}`,
      fulfillmentRate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
      avgTime: data.times.length > 0 ? data.times.reduce((a: number, b: number) => a + b, 0) / data.times.length : 0,
      activeSwaps: data.active,
    }))
    .sort((a, b) => b.fulfillmentRate - a.fulfillmentRate);

  // Peak hours analysis
  const hourlySwaps: Record<number, number> = {};
  swaps.forEach(swap => {
    if (swap.shift?.start_time) {
      const hour = new Date(swap.shift.start_time).getHours();
      hourlySwaps[hour] = (hourlySwaps[hour] || 0) + 1;
    }
  });

  const peakHours = Object.entries(hourlySwaps)
    .map(([hour, count]) => ({ hour: parseInt(hour), swaps: count }))
    .sort((a, b) => b.swaps - a.swaps)
    .slice(0, 5);

  // Shift coverage rate
  const coveredShifts = swaps.filter(s => s.covering_worker_id).length;
  const shiftCoverageRate = swaps.length > 0 ? Math.round((coveredShifts / swaps.length) * 100) : 0;

  // Swap reasons breakdown
  const swapReasons: Record<string, number> = {};
  swaps.forEach(swap => {
    const reason = swap.reason || "No reason provided";
    swapReasons[reason] = (swapReasons[reason] || 0) + 1;
  });

  // Manager workload
  const managerWorkload: Record<string, number> = {};
  swaps.forEach(swap => {
    if (swap.approved_by) {
      managerWorkload[swap.approved_by] = (managerWorkload[swap.approved_by] || 0) + 1;
    }
  });

  const managerWorkloadList = Object.entries(managerWorkload)
    .map(([managerId, swaps]) => ({ managerId, swaps }))
    .sort((a, b) => b.swaps - a.swaps);

  // Predicted busy times (next 7 days based on historical patterns)
  const predictedBusyTimes = peakHours
    .slice(0, 3)
    .map(h => `${String(h.hour).padStart(2, "0")}:00`);

  return {
    ...advanced,
    workerEngagementScore,
    departmentPerformance,
    peakHours,
    shiftCoverageRate,
    swapReasons,
    managerWorkload: managerWorkloadList,
    predictedBusyTimes,
  };
}
