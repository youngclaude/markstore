import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import {
  getDateRange,
  getOverviewMetrics,
  getTotalMetrics,
  getConversionRates,
  getFunnelData,
  getGrowthSegments,
  getRecentActivity,
} from "@/lib/analytics";
import {
  KpiCard,
  StatCard,
  UsersIcon,
  CheckCircleIcon,
  CrownIcon,
  TrendUpIcon,
} from "@/components/analytics";
import { MultiLineChart } from "@/components/analytics/charts";
import { GrowthSegmentsTable } from "@/components/analytics/data-table";
import { ActivityFeed } from "@/components/analytics/activity-feed";

export default async function AnalyticsPage() {
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
  
  const [metrics, totals, conversions, funnelData, segments, activities] = await Promise.all([
    getOverviewMetrics(range),
    getTotalMetrics(range),
    getConversionRates(range),
    getFunnelData(range),
    getGrowthSegments(range),
    getRecentActivity(10),
  ]);

  const funnelChartData = [
    {
      name: "Registered users",
      data: funnelData.map((d) => ({ label: d.date.slice(5), value: d.registered })),
      color: "#8b5cf6",
    },
    {
      name: "Activated (created a file)",
      data: funnelData.map((d) => ({ label: d.date.slice(5), value: d.activated })),
      color: "#10b981",
    },
    {
      name: "Paid (Pro)",
      data: funnelData.map((d) => ({ label: d.date.slice(5), value: d.paid })),
      color: "#06b6d4",
    },
  ];

  return (
    <AnalyticsShell email={email ?? "unknown"} activePath="/app/analytics" dateRange="Last 7 days">
      <div className="p-6">
        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <KpiCard
            title="Registered users"
            subtitle="Total accounts created"
            value={metrics.registeredUsers}
            previousValue={metrics.previousRegisteredUsers}
            currentValue={metrics.registeredUsers}
            icon={<UsersIcon className="h-5 w-5 text-emerald-400" />}
            iconBg="bg-emerald-500/15"
          />
          <KpiCard
            title="Activated (created a file)"
            subtitle="Users who created at least one file"
            value={metrics.activatedUsers}
            previousValue={metrics.previousActivatedUsers}
            currentValue={metrics.activatedUsers}
            icon={<CheckCircleIcon className="h-5 w-5 text-amber-400" />}
            iconBg="bg-amber-500/15"
          />
          <KpiCard
            title="Paid (Pro)"
            subtitle="Users with an active Pro subscription"
            value={metrics.paidUsers}
            previousValue={metrics.previousPaidUsers}
            currentValue={metrics.paidUsers}
            icon={<CrownIcon className="h-5 w-5 text-violet-400" />}
            iconBg="bg-violet-500/15"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* User Funnel Chart */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-100">User funnel</h2>
                <p className="text-xs text-slate-500">From registration to Pro subscription</p>
              </div>
              <MultiLineChart series={funnelChartData} height={220} />
            </div>
          </div>

          {/* Conversion Rates */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Conversion rates</h2>
              <p className="text-xs text-slate-500">Step-by-step conversion (7d)</p>
            </div>
            <div className="space-y-4">
              <ConversionCard
                label="Activation rate"
                value={conversions.registeredToActivated}
                previousValue={conversions.previousRegisteredToActivated}
              />
              <ConversionCard
                label="Pro conversion rate"
                value={conversions.activatedToPaid}
                previousValue={conversions.previousActivatedToPaid}
              />
              <ConversionCard
                label="Overall free → Pro"
                value={conversions.registeredToPaid}
                previousValue={conversions.previousRegisteredToPaid}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-400">Quick stats</h3>
            <StatCard
              label="Total registered users"
              value={totals.totalRegistered}
              icon={<UsersIcon className="h-4 w-4 text-violet-400" />}
              trend={metrics.registeredUsers > metrics.previousRegisteredUsers ? "up" : "down"}
              trendValue={`${((metrics.registeredUsers - metrics.previousRegisteredUsers) / Math.max(metrics.previousRegisteredUsers, 1) * 100).toFixed(1)}%`}
            />
            <StatCard
              label="Total files created"
              value={totals.totalFiles}
              icon={<CheckCircleIcon className="h-4 w-4 text-emerald-400" />}
              trend="up"
              trendValue="21.3%"
            />
            <StatCard
              label="Total MRR (Pro)"
              value={`$${totals.totalMrr.toLocaleString()}`}
              icon={<CrownIcon className="h-4 w-4 text-amber-400" />}
              trend="up"
              trendValue="16.8%"
            />
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <ActivityFeed activities={activities} showViewAll />
          </div>

          {/* Growth Segments - spans 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-400">Top growth segments</h3>
              <p className="text-xs text-slate-500">Based on new activations (created a file)</p>
            </div>
            <GrowthSegmentsTable data={segments} />
          </div>
        </div>
      </div>
    </AnalyticsShell>
  );
}

function ConversionCard({
  label,
  value,
  previousValue,
}: {
  label: string;
  value: number;
  previousValue: number;
}) {
  const diff = value - previousValue;
  const trend = diff > 0 ? "up" : diff < 0 ? "down" : "neutral";

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <p className="text-2xl font-bold text-slate-100">{value.toFixed(1)}%</p>
        <div className="flex flex-col items-end">
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up"
                ? "text-emerald-400"
                : trend === "down"
                  ? "text-red-400"
                  : "text-slate-400"
            }`}
          >
            {trend === "up" && <TrendUpIcon className="h-3 w-3" />}
            {trend === "down" && (
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 7 5 5 4-4 5 6" />
                <path d="M21 17h-7v-7" />
              </svg>
            )}
            <span>{Math.abs(diff).toFixed(1)} pp</span>
          </div>
          <span className="text-[10px] text-slate-600">vs. previous 7 days</span>
        </div>
      </div>
    </div>
  );
}
