import { Plan } from "./database.types";

export interface PlanLimits {
  maxWorkers: number;
  maxDepartments: number;
  hasROIMetrics: boolean;
  hasPrioritySupport: boolean;
  label: string;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial: {
    maxWorkers: 200, // Trial matches Growth
    maxDepartments: 100,
    hasROIMetrics: true,
    hasPrioritySupport: true,
    label: "Free Trial",
  },
  starter: {
    maxWorkers: 50,
    maxDepartments: 3,
    hasROIMetrics: false,
    hasPrioritySupport: false,
    label: "Starter",
  },
  pro: {
    maxWorkers: 200,
    maxDepartments: 100,
    hasROIMetrics: true,
    hasPrioritySupport: true,
    label: "Growth",
  },
  enterprise: {
    maxWorkers: 10000,
    maxDepartments: 1000,
    hasROIMetrics: true,
    hasPrioritySupport: true,
    label: "Enterprise",
  },
};

export function checkPlanLimit(orgPlan: Plan, metric: keyof PlanLimits): any {
  return PLAN_LIMITS[orgPlan][metric];
}

export function getMissingFeatures(fromPlan: Plan, toPlan: Plan): string[] {
  const from = PLAN_LIMITS[fromPlan];
  const to = PLAN_LIMITS[toPlan];
  const missing: string[] = [];

  if (from.hasROIMetrics && !to.hasROIMetrics) missing.push("ROI Analytics & Cost Savings Tracking");
  if (from.maxWorkers > to.maxWorkers) missing.push(`Worker limit reduced from ${from.maxWorkers === 10000 ? "Unlimited" : from.maxWorkers} to ${to.maxWorkers}`);
  if (from.maxDepartments > to.maxDepartments) missing.push(`Department limit reduced from ${from.maxDepartments} to ${to.maxDepartments}`);
  if (from.hasPrioritySupport && !to.hasPrioritySupport) missing.push("Priority Support");

  return missing;
}
