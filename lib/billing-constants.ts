export type Plan = "free" | "pro";

export type SubscriptionStatus = 
  | "active" 
  | "canceled" 
  | "incomplete" 
  | "incomplete_expired" 
  | "past_due" 
  | "paused" 
  | "trialing" 
  | "unpaid";

export const PLAN_LIMITS = {
  free: {
    projects: 3,
    storageGb: 1,
    apiCallsPerMonth: 1000,
  },
  pro: {
    projects: 50,
    storageGb: 100,
    apiCallsPerMonth: 100000,
  },
} as const;

export const PLAN_FEATURES = {
  free: {
    name: "Free",
    price: 0,
    description: "Perfect for getting started and exploring MarkStore.",
    features: [
      "Core features included",
      "Basic support",
      "No credit card required",
    ],
    limits: [
      `Up to ${PLAN_LIMITS.free.projects} projects`,
      `Up to ${PLAN_LIMITS.free.storageGb} GB storage`,
      `Up to ${PLAN_LIMITS.free.apiCallsPerMonth.toLocaleString()} API calls/month`,
    ],
  },
  pro: {
    name: "Pro",
    price: 9,
    description: "Built for teams and power users who need more.",
    features: [
      "Everything in Free",
      "Full API access",
      "Team sharing & collaboration",
      "Priority support",
    ],
    limits: [
      `Up to ${PLAN_LIMITS.pro.projects} projects`,
      `Up to ${PLAN_LIMITS.pro.storageGb} GB storage`,
      `Up to ${PLAN_LIMITS.pro.apiCallsPerMonth.toLocaleString()} API calls/month`,
    ],
  },
} as const;

export function canCreateProject(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].projects;
}

export function formatPlanName(plan: Plan): string {
  return plan === "pro" ? "Pro" : "Free";
}
