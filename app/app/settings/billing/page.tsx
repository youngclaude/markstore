import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { BillingClient } from "@/components/billing-client";
import { CreditCardIcon } from "@/components/icons";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { getUserBilling, getEffectivePlan, getProjectCount, PLAN_LIMITS } from "@/lib/billing";
import { isAdminEmail } from "@/lib/admin";

export default async function BillingPage() {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will handle missing secret */
  }
  const session = await auth();
  const email = session?.user?.email ?? "unknown";
  const userId = session?.user?.id;
  const isAdmin = isAdminEmail(email);

  if (!userId) {
    return (
      <AppShell email={email} activeFolder="__billing__" isAdmin={isAdmin}>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-slate-400">Please sign in to view billing.</p>
        </div>
      </AppShell>
    );
  }

  const userBilling = await getUserBilling(userId);
  const plan = userBilling ? getEffectivePlan(userBilling) : "free";
  const projectCount = await getProjectCount(userId);

  const usageData = {
    projects: {
      used: projectCount,
      limit: PLAN_LIMITS[plan].projects,
    },
    storage: {
      usedGb: 0,
      limitGb: PLAN_LIMITS[plan].storageGb,
    },
    apiCalls: {
      used: 0,
      limit: PLAN_LIMITS[plan].apiCallsPerMonth,
    },
  };

  return (
    <AppShell email={email} activeFolder="__billing__" isAdmin={isAdmin}>
      <header className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
          <CreditCardIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-slate-500">
            Manage your subscription, payment method, and billing details.
          </p>
        </div>
      </header>
      <section className="flex-1 px-6 py-5">
        <BillingClient
          plan={plan}
          userBilling={userBilling ? {
            stripeCustomerId: userBilling.stripe_customer_id,
            subscriptionId: userBilling.subscription_id,
            subscriptionStatus: userBilling.subscription_status,
            subscriptionEndsAt: userBilling.subscription_ends_at,
          } : null}
          usage={usageData}
        />
      </section>
    </AppShell>
  );
}
