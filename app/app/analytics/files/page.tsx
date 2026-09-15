import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import {
  getDateRange,
  getFileMixMetrics,
  getFileMixOverTime,
  getTopFilenamePatterns,
} from "@/lib/analytics";
import { KpiCard, FileTextIcon } from "@/components/analytics";
import { PieChart, StackedBarChart } from "@/components/analytics/charts";
import { FilenameTable } from "@/components/analytics/data-table";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default async function FileMixPage() {
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

  const range = getDateRange(30);
  const [metrics, overTimeData, patterns] = await Promise.all([
    getFileMixMetrics(range),
    getFileMixOverTime(range),
    getTopFilenamePatterns(range),
  ]);

  const markdownPercent = metrics.totalFiles > 0
    ? (metrics.markdownFiles / metrics.totalFiles) * 100
    : 0;
  const jsonPercent = metrics.totalFiles > 0
    ? (metrics.jsonFiles / metrics.totalFiles) * 100
    : 0;

  const pieData = [
    { label: `Markdown (.md)`, value: metrics.markdownFiles, color: "#8b5cf6" },
    { label: `JSON (.json)`, value: metrics.jsonFiles, color: "#f59e0b" },
  ];

  const barChartData = overTimeData.map((d) => ({
    label: d.date.slice(5),
    values: [
      { name: "Markdown", value: d.markdown, color: "#8b5cf6" },
      { name: "JSON", value: d.json, color: "#f59e0b" },
    ],
  }));

  const tableData = patterns.map((p, i) => ({
    rank: i + 1,
    pattern: p.pattern,
    type: p.type,
    count: p.count,
    share: p.share,
    trend: p.trend,
  }));

  return (
    <AnalyticsShell email={email ?? "unknown"} activePath="/app/analytics/files" dateRange="Last 30 days">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">File Mix</h1>
          <p className="text-sm text-slate-400">
            Overview of file types, formats, and top filenames in your MarkStore.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiCard
            title="Total Files"
            value={metrics.totalFiles}
            previousValue={metrics.previousTotalFiles}
            currentValue={metrics.totalFiles}
            icon={<FileTextIcon className="h-5 w-5 text-slate-400" />}
            iconBg="bg-slate-500/15"
          />
          <KpiCard
            title="Markdown Files"
            subtitle={`${markdownPercent.toFixed(1)}%`}
            value={metrics.markdownFiles}
            previousValue={metrics.previousMarkdownFiles}
            currentValue={metrics.markdownFiles}
            icon={
              <svg className="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 5h16v14H4z" />
                <path d="M7 15V9l2.5 4L12 9v6M15 12h2a1.5 1.5 0 0 0 0-3h-2v6" />
              </svg>
            }
            iconBg="bg-violet-500/15"
          />
          <KpiCard
            title="JSON Files"
            subtitle={`${jsonPercent.toFixed(1)}%`}
            value={metrics.jsonFiles}
            previousValue={metrics.previousJsonFiles}
            currentValue={metrics.jsonFiles}
            icon={
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 4c-2 0-3 1.5-3 4v2c0 1.5-1 2.5-2 3 1 .5 2 1.5 2 3v2c0 2.5 1 4 3 4" />
                <path d="M16 4c2 0 3 1.5 3 4v2c0 1.5 1 2.5 2 3-1 .5-2 1.5-2 3v2c0 2.5-1 4-3 4" />
              </svg>
            }
            iconBg="bg-amber-500/15"
          />
          <KpiCard
            title="Total Size"
            value={formatBytes(metrics.totalSize)}
            icon={
              <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 16v-8M12 16V8M17 16v-4" />
              </svg>
            }
            iconBg="bg-emerald-500/15"
          />
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Markdown vs JSON Share</h2>
              <p className="text-xs text-slate-500">Distribution of stored files by file type.</p>
            </div>
            <div className="flex items-center justify-center py-4">
              <PieChart data={pieData} size={200} />
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">File Mix Over Time</h2>
                <p className="text-xs text-slate-500">Daily share of Markdown vs JSON files.</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span className="text-slate-400">Markdown</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-400">JSON</span>
                </div>
              </div>
            </div>
            <StackedBarChart data={barChartData} height={200} showLegend={false} />
          </div>
        </div>

        {/* Filename Patterns Table */}
        <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Top Filenames / Patterns</h2>
              <p className="text-xs text-slate-500">Most common filenames and path patterns in your store.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-400 ring-1 ring-blue-500/30">
                All
              </button>
              <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800">
                Markdown
              </button>
              <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800">
                JSON
              </button>
            </div>
          </div>
          <FilenameTable data={tableData} />
        </div>
      </div>
    </AnalyticsShell>
  );
}
