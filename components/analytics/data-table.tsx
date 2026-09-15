import { TrendUpIcon, TrendDownIcon } from "./icons";
import { Sparkline } from "./charts";

type Column<T> = {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (value: T[keyof T] | undefined, row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800/60">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-slate-800/30 transition-colors hover:bg-slate-800/20"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 text-sm text-slate-300"
                >
                  {col.render
                    ? col.render(row[col.key as keyof T], row)
                    : String(row[col.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500">
          No data available
        </div>
      )}
    </div>
  );
}

type GrowthTableRow = {
  segment: string;
  registeredUsers: number;
  activatedUsers: number;
  paidUsers: number;
  activationRate: number;
  proConversionRate: number;
  registeredGrowth: number;
};

export function GrowthSegmentsTable({ data }: { data: GrowthTableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-[#0F1218]/60">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800/60 bg-slate-900/30">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Segment
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registered users
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Activated
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Paid (Pro)
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Activation rate
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pro conversion rate
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.segment}
              className="border-b border-slate-800/30 transition-colors hover:bg-slate-800/20"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-slate-200">
                    {row.segment}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-slate-300">
                    {row.registeredUsers.toLocaleString()}
                  </span>
                  <TrendBadge value={row.registeredGrowth} />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-slate-300">
                    {row.activatedUsers.toLocaleString()}
                  </span>
                  <TrendBadge value={row.activationRate} suffix="%" small />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-slate-300">
                    {row.paidUsers.toLocaleString()}
                  </span>
                  <TrendBadge value={row.proConversionRate} suffix="%" small />
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-300">
                {row.activationRate.toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-300">
                {row.proConversionRate.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type FilenameTableRow = {
  rank: number;
  pattern: string;
  type: "md" | "json";
  count: number;
  share: number;
  trend: number;
};

export function FilenameTable({ data }: { data: FilenameTableRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800/60 bg-[#0F1218]/60">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800/60 bg-slate-900/30">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              #
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Filename / Pattern
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Count
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Share
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={`${row.rank}-${row.pattern}`}
              className="border-b border-slate-800/30 transition-colors hover:bg-slate-800/20"
            >
              <td className="px-4 py-3 text-sm text-slate-500">{row.rank}</td>
              <td className="px-4 py-3">
                <span className="text-sm font-medium text-slate-200">
                  {row.pattern}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                    row.type === "md"
                      ? "bg-violet-500/15 text-violet-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {row.type === "md" ? "Markdown" : "JSON"}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-300">
                {row.count.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right text-sm text-slate-300">
                {row.share.toFixed(1)}%
              </td>
              <td className="px-4 py-3 text-right">
                <TrendBadge value={row.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AIPatternTableRow = {
  pattern: string;
  description: string;
  count: number;
  percentage: number;
  icon?: React.ReactNode;
};

export function AIPatternTable({ data }: { data: AIPatternTableRow[] }) {
  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div
          key={row.pattern}
          className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-[#0F1218]/60 p-4 transition-colors hover:bg-slate-800/20"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20">
            {row.icon || (
              <span className="text-lg">📄</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-200">{row.pattern}</p>
            <p className="text-xs text-slate-500">{row.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-100">
              {row.count.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">
              {row.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="w-32">
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${Math.min(row.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendBadge({
  value,
  suffix = "%",
  small = false,
}: {
  value: number;
  suffix?: string;
  small?: boolean;
}) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${small ? "text-[10px]" : "text-xs"} font-medium ${
        isNeutral
          ? "text-slate-500"
          : isPositive
            ? "text-emerald-400"
            : "text-red-400"
      }`}
    >
      {!isNeutral && (isPositive ? "↑" : "↓")}
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
