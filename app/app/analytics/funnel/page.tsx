import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { getDateRange, getFunnelStageData, getTotalMetrics } from "@/lib/analytics";
import { VerticalFunnel } from "@/components/analytics/funnel-chart";
import { StatCard, UsersIcon, CheckCircleIcon, CrownIcon, TrendUpIcon } from "@/components/analytics";

export default async function FunnelPage() {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will handle missing secret */
  }

  const session = await auth();
  const email = session?.user?.email;

  if (!isAdminEmail(email)) {
    redirect("/app");
  }

  const range = getDateRange(7);
  const [funnelData, totals] = await Promise.all([
    getFunnelStageData(range),
    getTotalMetrics(range),
  ]);

  const { current, previous } = funnelData;

  return (
    <AnalyticsShell email={email ?? "unknown"} activePath="/app/analytics/funnel" dateRange="Last 7 days">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Conversion Funnel
          </p>
          <h1 className="text-2xl font-bold text-slate-100">From Sign Up to Pro</h1>
          <p className="text-sm text-slate-400">
            See how many users move from registration to their first file, and finally to a paid Pro plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Funnel Visualization */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-8">
            <VerticalFunnel
              registered={current.registered}
              activated={current.activated}
              paid={current.paid}
            />
          </div>

          {/* Conversion Rate Cards */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
              <h2 className="mb-4 text-lg font-semibold text-slate-100">Conversion Rates</h2>
              
              <div className="space-y-4">
                <ConversionRateCard
                  label="Registered → Activated"
                  rate={current.registeredToActivated}
                  previousRate={previous.registeredToActivated}
                  numerator={current.activated}
                  denominator={current.registered}
                />
                <ConversionRateCard
                  label="Activated → Paid Pro"
                  rate={current.activatedToPaid}
                  previousRate={previous.activatedToPaid}
                  numerator={current.paid}
                  denominator={current.activated}
                />
                <ConversionRateCard
                  label="Registered → Paid Pro"
                  rate={current.registeredToPaid}
                  previousRate={previous.registeredToPaid}
                  numerator={current.paid}
                  denominator={current.registered}
                />
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800/60 bg-[#0F1218]/80 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15">
                  <UsersIcon className="h-5 w-5 text-violet-400" />
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  {current.registered.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Registered</p>
                <GrowthIndicator
                  current={current.registered}
                  previous={previous.registered}
                />
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-[#0F1218]/80 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  {current.activated.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Activated (first file)</p>
                <GrowthIndicator
                  current={current.activated}
                  previous={previous.activated}
                />
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-[#0F1218]/80 p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/15">
                  <CrownIcon className="h-5 w-5 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  {current.paid.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Paid Pro $9</p>
                <GrowthIndicator
                  current={current.paid}
                  previous={previous.paid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsShell>
  );
}

function ConversionRateCard({
  label,
  rate,
  previousRate,
  numerator,
  denominator,
}: {
  label: string;
  rate: number;
  previousRate: number;
  numerator: number;
  denominator: number;
}) {
  const diff = rate - previousRate;
  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/30 p-4">
      <div>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="text-3xl font-bold text-slate-100">{rate.toFixed(1)}%</p>
        <p className="text-xs text-slate-500">
          {numerator.toLocaleString()} / {denominator.toLocaleString()}
        </p>
      </div>
      <div className="text-right">
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trend === "up"
              ? "text-emerald-400"
              : trend === "down"
                ? "text-red-400"
                : "text-slate-400"
          }`}
        >
          {trend === "up" && <TrendUpIcon className="h-4 w-4" />}
          {trend === "down" && (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m7 7 5 5 4-4 5 6" />
              <path d="M21 17h-7v-7" />
            </svg>
          )}
          <span>{diff > 0 ? "+" : ""}{diff.toFixed(1)}%</span>
        </div>
        <p className="text-xs text-slate-600">vs. previous 7 days</p>
      </div>
    </div>
  );
}

function GrowthIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0) return null;
  
  const growth = ((current - previous) / previous) * 100;
  const trend = growth > 0 ? "up" : growth < 0 ? "down" : "neutral";

  return (
    <p
      className={`mt-1 text-xs font-medium ${
        trend === "up"
          ? "text-emerald-400"
          : trend === "down"
            ? "text-red-400"
            : "text-slate-400"
      }`}
    >
      {trend === "up" && "↑"}
      {trend === "down" && "↓"}
      {Math.abs(growth).toFixed(1)}%
      <span className="text-slate-600"> vs. previous 7 days</span>
    </p>
  );
}
