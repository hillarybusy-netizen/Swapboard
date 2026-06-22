import { Plan } from "./database.types";

export interface PlanLimits {
  maxWorkers: number;
  maxDepartments: number;
  hasROIMetrics: boolean;
  hasPrioritySupport: boolean;
  hasBasicAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  hasEnterpriseAnalytics: boolean;
  label: string;
  price: number;
  priceLabel: string;
  features: string[];
  highlight?: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  trial: {
    maxWorkers: 200,
    maxDepartments: 100,
    hasROIMetrics: true,
    hasPrioritySupport: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    hasEnterpriseAnalytics: true,
    label: "Free Trial",
    price: 0,
    priceLabel: "$0",
    features: ["All Enterprise features", "14-day trial", "No credit card required"],
  },
  starter: {
    maxWorkers: 100,
    maxDepartments: 3,
    hasROIMetrics: false,
    hasPrioritySupport: false,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: false,
    hasEnterpriseAnalytics: false,
    label: "Starter",
    price: 79,
    priceLabel: "$79/month",
    features: ["Up to 100 workers", "3 departments", "Basic analytics", "Email support"],
  },
  pro: {
    maxWorkers: 200,
    maxDepartments: 100,
    hasROIMetrics: true,
    hasPrioritySupport: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    hasEnterpriseAnalytics: false,
    label: "Growth",
    price: 199,
    priceLabel: "$199/month",
    features: ["Up to 200 workers", "Unlimited departments", "ROI analytics", "Priority support", "Custom roles"],
    highlight: true,
  },
  enterprise: {
    maxWorkers: 10000,
    maxDepartments: 1000,
    hasROIMetrics: true,
    hasPrioritySupport: true,
    hasBasicAnalytics: true,
    hasAdvancedAnalytics: true,
    hasEnterpriseAnalytics: true,
    label: "Enterprise",
    price: 499,
    priceLabel: "$499/month",
    features: ["Unlimited workers", "Multi-location", "Advanced analytics", "Dedicated support", "SSO & compliance"],
  },
};

export const BILLABLE_PLANS: Plan[] = ["starter", "pro", "enterprise"];

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
