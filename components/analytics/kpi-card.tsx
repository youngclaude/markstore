import { TrendUpIcon, TrendDownIcon } from "./icons";

type KpiCardProps = {
  title: string;
  subtitle?: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

export function KpiCard({
  title,
  subtitle,
  value,
  previousValue,
  currentValue,
  icon,
  iconBg = "bg-emerald-500/15",
  trend,
  trendValue,
}: KpiCardProps) {
  const calculatedTrend = trend ?? (previousValue !== undefined && currentValue !== undefined
    ? currentValue > previousValue
      ? "up"
      : currentValue < previousValue
        ? "down"
        : "neutral"
    : undefined);

  const calculatedTrendValue = trendValue ?? (previousValue !== undefined && currentValue !== undefined && previousValue > 0
    ? `${(((currentValue - previousValue) / previousValue) * 100).toFixed(1)}%`
    : undefined);

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-3xl font-bold tracking-tight text-slate-50">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {calculatedTrend && calculatedTrendValue && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              calculatedTrend === "up"
                ? "bg-emerald-500/15 text-emerald-400"
                : calculatedTrend === "down"
                  ? "bg-red-500/15 text-red-400"
                  : "bg-slate-500/15 text-slate-400"
            }`}
          >
            {calculatedTrend === "up" ? (
              <TrendUpIcon className="h-3 w-3" />
            ) : calculatedTrend === "down" ? (
              <TrendDownIcon className="h-3 w-3" />
            ) : null}
            <span>{calculatedTrendValue}</span>
            <span className="text-slate-500">vs. previous 7 days</span>
          </div>
        )}
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

export function StatCard({ label, value, icon, trend, trendValue }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-[#0F1218]/60 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800/50">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-lg font-semibold text-slate-100">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {trend && trendValue && (
            <span
              className={`text-xs font-medium ${
                trend === "up"
                  ? "text-emerald-400"
                  : trend === "down"
                    ? "text-red-400"
                    : "text-slate-400"
              }`}
            >
              {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
