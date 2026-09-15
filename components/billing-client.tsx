"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  CrownIcon,
  CalendarIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  SparkleIcon,
} from "@/components/icons";
import { UpgradeModal } from "@/components/upgrade-modal";
import { PLAN_FEATURES, PLAN_LIMITS, type Plan } from "@/lib/billing-constants";

type UsageData = {
  projects: { used: number; limit: number };
  storage: { usedGb: number; limitGb: number };
  apiCalls: { used: number; limit: number };
};

type UserBillingData = {
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
} | null;

function UsageBar({
  label,
  icon,
  used,
  limit,
  unit = "",
}: {
  label: string;
  icon: string;
  used: number;
  limit: number;
  unit?: string;
}) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isNearLimit = percentage >= 80;

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
        <span className="text-sm text-slate-400">
          {used.toLocaleString()}
          {unit} / {limit.toLocaleString()}
          {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? "bg-amber-500" : "bg-[#1D7BFF]"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">Limit: {limit.toLocaleString()}{unit}</p>
    </div>
  );
}

function FreePlanCard({
  usage,
  onUpgrade,
}: {
  usage: UsageData;
  onUpgrade: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Plan Card */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-700/50 px-3 py-1 text-xs font-medium text-slate-300">
            Current plan
          </span>
        </div>

        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <span className="text-2xl">🌱</span>
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Free</h2>
            <p className="text-sm text-slate-400">{PLAN_FEATURES.free.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">$0</div>
            <div className="text-sm text-slate-400">/month</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-emerald-400">✓</span>
            <span>Up to {PLAN_LIMITS.free.projects} projects</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-emerald-400">✓</span>
            <span>Up to {PLAN_LIMITS.free.storageGb} GB storage</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="text-emerald-400">✓</span>
            <span>Basic support</span>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Usage
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Your current usage for this billing period.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <UsageBar
            label="Projects"
            icon="📁"
            used={usage.projects.used}
            limit={usage.projects.limit}
          />
          <UsageBar
            label="Storage"
            icon="💾"
            used={usage.storage.usedGb}
            limit={usage.storage.limitGb}
            unit=" GB"
          />
          <UsageBar
            label="API Calls"
            icon="</>"
            used={usage.apiCalls.used}
            limit={usage.apiCalls.limit}
          />
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-2xl border border-[#6366F1]/30 bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
            <SparkleIcon className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Upgrade to Pro</h3>
            <p className="mt-1 text-sm text-slate-400">
              Get up to {PLAN_LIMITS.pro.projects} projects, {PLAN_LIMITS.pro.storageGb} GB storage, full API access, and priority support.
            </p>
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={onUpgrade}
                className="rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5558E3]"
              >
                Upgrade to Pro — $9/mo
              </button>
              <span className="text-sm text-slate-500">Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs text-slate-500">
        Need to change your payment method or cancel? Manage billing via the Stripe customer portal after upgrading.
      </p>
    </div>
  );
}

function ProPlanCard({
  usage,
  billing,
  onManageBilling,
}: {
  usage: UsageData;
  billing: NonNullable<UserBillingData>;
  onManageBilling: () => void;
}) {
  const renewalDate = billing.subscriptionEndsAt
    ? new Date(billing.subscriptionEndsAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const isActive = billing.subscriptionStatus === "active" || billing.subscriptionStatus === "trialing";
  const isCanceled = billing.subscriptionStatus === "canceled";

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {isActive && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-200">
            All set! Your plan is active.
          </span>
        </div>
      )}

      {isCanceled && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <CalendarIcon className="h-5 w-5 text-amber-400" />
          <span className="text-sm font-medium text-amber-200">
            Your subscription is canceled but active until {renewalDate}.
          </span>
        </div>
      )}

      {/* Plan Card */}
      <div className="rounded-2xl border border-[#6366F1]/40 bg-gradient-to-b from-[#6366F1]/10 to-transparent p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-[#6366F1] px-3 py-1 text-xs font-semibold text-white">
            Active
          </span>
        </div>

        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#818CF8]">
            <CrownIcon className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Pro Plan</h2>
            <p className="text-sm text-slate-400">{PLAN_FEATURES.pro.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">$9</div>
            <div className="text-sm text-slate-400">/month</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {[
            "Unlimited products",
            "Advanced analytics",
            "Priority support",
            "Custom branding",
            "Higher API limits",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-[#818CF8]">✓</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
              <CalendarIcon className="h-5 w-5 text-slate-400" />
            </span>
            <div>
              <p className="text-xs text-slate-500">Next renewal date</p>
              <p className="font-medium text-white">{renewalDate}</p>
              <p className="text-xs text-slate-500">
                Your Pro plan will renew automatically on this date.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
              <CreditCardIcon className="h-5 w-5 text-slate-400" />
            </span>
            <div>
              <p className="text-xs text-slate-500">Payment method</p>
              <p className="font-medium text-white">•••• 4242</p>
              <p className="text-xs text-slate-500">Expires 12/2027</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Usage
        </h3>
        <p className="mb-4 text-xs text-slate-500">
          Your current usage for this billing period.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <UsageBar
            label="Projects"
            icon="📁"
            used={usage.projects.used}
            limit={usage.projects.limit}
          />
          <UsageBar
            label="Storage"
            icon="💾"
            used={usage.storage.usedGb}
            limit={usage.storage.limitGb}
            unit=" GB"
          />
          <UsageBar
            label="API Calls"
            icon="</>"
            used={usage.apiCalls.used}
            limit={usage.apiCalls.limit}
          />
        </div>
      </div>

      {/* Manage Billing */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#635BFF]/15">
            <span className="text-lg font-bold text-[#635BFF]">S</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-white">Update payment method</h4>
            <p className="text-sm text-slate-400">
              Manage your payment details, change your card, or add a backup method via Stripe's secure customer portal.
            </p>
          </div>
          <button
            onClick={onManageBilling}
            className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Open Stripe Customer Portal
            <ExternalLinkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cancel Plan */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
            <span className="text-red-400">⚠️</span>
          </span>
          <div className="flex-1">
            <h4 className="font-medium text-red-200">Cancel plan</h4>
            <p className="mt-1 text-sm text-slate-400">
              You can cancel your Pro plan at any time. You'll continue to have access until the end of your current billing period.
            </p>
          </div>
          <button
            onClick={onManageBilling}
            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Cancel via Portal
          </button>
        </div>
      </div>

      {/* Invoice History Placeholder */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Invoice history
        </h3>
        <p className="mb-4 text-xs text-slate-500">Your past invoices and payments.</p>
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
            <CreditCardIcon className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-sm text-slate-400">No invoices yet</p>
          <p className="text-xs text-slate-500">
            Your invoice history will appear here once you make a payment or upgrade to a paid plan.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BillingClient({
  plan,
  userBilling,
  usage,
}: {
  plan: Plan;
  userBilling: UserBillingData;
  usage: UsageData;
}) {
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  async function handleManageBilling() {
    if (!userBilling?.stripeCustomerId) return;
    
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error("Failed to open billing portal");
    } finally {
      setManagingBilling(false);
    }
  }

  return (
    <>
      {plan === "free" ? (
        <FreePlanCard usage={usage} onUpgrade={() => setShowUpgrade(true)} />
      ) : (
        <ProPlanCard
          usage={usage}
          billing={userBilling!}
          onManageBilling={handleManageBilling}
        />
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
}
