import { getDb, type UserRow } from "@/lib/db";
export {
  type Plan,
  type SubscriptionStatus,
  PLAN_LIMITS,
  PLAN_FEATURES,
  canCreateProject,
  formatPlanName,
} from "@/lib/billing-constants";
import type { Plan, SubscriptionStatus } from "@/lib/billing-constants";

export type UserBilling = UserRow & {
  stripe_customer_id: string | null;
  plan: Plan;
  subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  subscription_ends_at: string | null;
};

export async function getUserBilling(userId: string): Promise<UserBilling | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, email, password_hash, plan_to_store, created_at,
              stripe_customer_id, plan, subscription_id, subscription_status, subscription_ends_at
       FROM users WHERE id = ?`
    )
    .bind(userId)
    .first<UserBilling>();
  return row ?? null;
}

export async function getUserBillingByEmail(email: string): Promise<UserBilling | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, email, password_hash, plan_to_store, created_at,
              stripe_customer_id, plan, subscription_id, subscription_status, subscription_ends_at
       FROM users WHERE email = ?`
    )
    .bind(email.toLowerCase())
    .first<UserBilling>();
  return row ?? null;
}

export async function getUserByStripeCustomer(customerId: string): Promise<UserBilling | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, email, password_hash, plan_to_store, created_at,
              stripe_customer_id, plan, subscription_id, subscription_status, subscription_ends_at
       FROM users WHERE stripe_customer_id = ?`
    )
    .bind(customerId)
    .first<UserBilling>();
  return row ?? null;
}

export async function updateUserBilling(
  userId: string,
  data: {
    stripeCustomerId?: string;
    plan?: Plan;
    subscriptionId?: string | null;
    subscriptionStatus?: SubscriptionStatus | null;
    subscriptionEndsAt?: string | null;
  }
): Promise<void> {
  const setClauses: string[] = [];
  const values: (string | null)[] = [];

  if (data.stripeCustomerId !== undefined) {
    setClauses.push("stripe_customer_id = ?");
    values.push(data.stripeCustomerId);
  }
  if (data.plan !== undefined) {
    setClauses.push("plan = ?");
    values.push(data.plan);
  }
  if (data.subscriptionId !== undefined) {
    setClauses.push("subscription_id = ?");
    values.push(data.subscriptionId);
  }
  if (data.subscriptionStatus !== undefined) {
    setClauses.push("subscription_status = ?");
    values.push(data.subscriptionStatus);
  }
  if (data.subscriptionEndsAt !== undefined) {
    setClauses.push("subscription_ends_at = ?");
    values.push(data.subscriptionEndsAt);
  }

  if (setClauses.length === 0) return;

  values.push(userId);
  await getDb()
    .prepare(`UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function getProjectCount(userId: string): Promise<number> {
  const result = await getDb()
    .prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ?")
    .bind(userId)
    .first<{ count: number }>();
  return result?.count ?? 0;
}

export function getEffectivePlan(user: UserBilling): Plan {
  if (user.plan === "pro") {
    if (user.subscription_status === "active" || user.subscription_status === "trialing") {
      return "pro";
    }
    if (user.subscription_ends_at) {
      const endsAt = new Date(user.subscription_ends_at);
      if (endsAt > new Date()) {
        return "pro";
      }
    }
    return "free";
  }
  return "free";
}
