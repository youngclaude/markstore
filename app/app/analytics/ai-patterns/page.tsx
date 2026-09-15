import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { getAIFilePatterns } from "@/lib/analytics";
import { BarChart } from "@/components/analytics/charts";
import { AIPatternTable } from "@/components/analytics/data-table";
import { LightbulbIcon, TargetIcon, BrainIcon } from "@/components/analytics";

export default async function AIFilePatternPage() {
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

  const { patterns, totalRepos, insights, opportunities } = await getAIFilePatterns();

  const barChartData = patterns.map((p) => ({
    label: p.pattern.length > 12 ? p.pattern.slice(0, 12) + "…" : p.pattern,
    value: p.count,
  }));

  const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

  const tableData = patterns.map((p, i) => ({
    pattern: p.pattern,
    description: p.description,
    count: p.count,
    percentage: p.percentage,
    icon: getPatternIcon(p.pattern),
  }));

  return (
    <AnalyticsShell email={email ?? "unknown"} activePath="/app/analytics/ai-patterns" dateRange="Last 30 days">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
            ◉ Market Research
          </p>
          <h1 className="text-2xl font-bold text-slate-100">AI File Patterns</h1>
          <p className="text-sm text-slate-400">
            Analyze how AI teams structure their projects. Discover common file patterns,
            usage frequency and emerging trends across repositories.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex items-center gap-2 border-b border-slate-800/60 pb-3">
          <button className="flex items-center gap-2 rounded-lg bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-100 ring-1 ring-slate-700">
            <BrainIcon className="h-4 w-4" />
            Overview
          </button>
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50">
            By Tool
          </button>
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50">
            {"</>"}
            By Language
          </button>
          <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800/50">
            By Industry
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pattern List */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-100">AI File Patterns</h2>
              <p className="text-xs text-slate-500">
                Total repositories analyzed: {totalRepos.toLocaleString()}
              </p>
            </div>
            <AIPatternTable data={tableData} />
          </div>

          {/* Bar Chart */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-100">Pattern Frequency</h2>
              <p className="text-xs text-slate-500">
                How often each pattern appears across analyzed repositories
              </p>
            </div>
            <div className="space-y-3">
              {patterns.map((p, i) => {
                const maxCount = Math.max(...patterns.map((pp) => pp.count), 1);
                const width = (p.count / maxCount) * 100;
                return (
                  <div key={p.pattern} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{p.pattern}</span>
                      <span className="text-slate-400">{p.count.toLocaleString()}</span>
                    </div>
                    <div className="h-8 overflow-hidden rounded-lg bg-slate-800/50">
                      <div
                        className="flex h-full items-center rounded-lg transition-all"
                        style={{
                          width: `${Math.max(width, 5)}%`,
                          backgroundColor: colors[i % colors.length],
                        }}
                      >
                        {width > 30 && (
                          <span className="px-3 text-xs font-medium text-white">
                            {p.count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Insights and Opportunities */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Key Takeaways */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15">
                <LightbulbIcon className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Key Takeaways</h3>
            </div>
            <ul className="space-y-2">
              {insights.length > 0 ? (
                insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {insight}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">No insights available yet.</li>
              )}
            </ul>
          </div>

          {/* Market Insights */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                <BrainIcon className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Market Insights</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                AI teams prioritize Claude configuration files
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                Agent instructions are widely adopted across tools
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                Cursor-specific rules are growing in popularity
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                Memory files remain a niche but important pattern
              </li>
            </ul>
          </div>

          {/* Opportunities */}
          <div className="rounded-2xl border border-slate-800/60 bg-[#0F1218]/80 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <TargetIcon className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-100">Opportunities</h3>
            </div>
            <ul className="space-y-2">
              {opportunities.map((opp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 rounded-2xl border border-slate-800/60 bg-gradient-to-r from-slate-900/80 to-[#0F1218]/80 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20">
              <BrainIcon className="h-6 w-6 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-100">Smarter research. Better decisions.</h3>
              <p className="text-sm text-slate-400">
                MarkStore helps you understand how AI teams configure, organize and use their project files.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsShell>
  );
}

function getPatternIcon(pattern: string): React.ReactNode {
  const iconClass = "h-4 w-4";
  
  switch (pattern.toLowerCase()) {
    case "claude.md":
      return (
        <svg className={`${iconClass} text-violet-400`} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case "agents.md":
      return (
        <svg className={`${iconClass} text-blue-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
    case ".cursor/rules":
      return (
        <svg className={`${iconClass} text-cyan-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    case "memory.md":
      return (
        <svg className={`${iconClass} text-emerald-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10M7 12h10M7 16h6" />
        </svg>
      );
    case "agent-config.json":
      return (
        <svg className={`${iconClass} text-amber-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2" />
        </svg>
      );
    default:
      return (
        <svg className={`${iconClass} text-slate-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );
  }
}
