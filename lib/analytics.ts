import { getDb } from "@/lib/db";

// Date range utilities
export type DateRange = {
  start: Date;
  end: Date;
  label: string;
  days: number;
};

export function getDateRange(days: number): DateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    start,
    end,
    label: `Last ${days} days`,
    days,
  };
}

export function getPreviousDateRange(range: DateRange): DateRange {
  const start = new Date(range.start);
  start.setDate(start.getDate() - range.days);
  const end = new Date(range.start);
  return {
    start,
    end,
    label: `Previous ${range.days} days`,
    days: range.days,
  };
}

// Core metrics
export type OverviewMetrics = {
  registeredUsers: number;
  activatedUsers: number;
  paidUsers: number;
  previousRegisteredUsers: number;
  previousActivatedUsers: number;
  previousPaidUsers: number;
};

export async function getOverviewMetrics(range: DateRange): Promise<OverviewMetrics> {
  const db = getDb();
  const previousRange = getPreviousDateRange(range);

  // Registered users in current period
  const registered = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE created_at >= ? AND created_at < ?`
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .first<{ count: number }>();

  // Registered users in previous period
  const previousRegistered = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE created_at >= ? AND created_at < ?`
    )
    .bind(previousRange.start.toISOString(), previousRange.end.toISOString())
    .first<{ count: number }>();

  // Activated users (users who created at least one file) in current period
  const activated = await db
    .prepare(
      `SELECT COUNT(DISTINCT u.id) as count FROM users u
       WHERE EXISTS (
         SELECT 1 FROM files f WHERE f.user_id = u.id AND f.created_at < ?
       )
       AND u.created_at >= ? AND u.created_at < ?`
    )
    .bind(range.end.toISOString(), range.start.toISOString(), range.end.toISOString())
    .first<{ count: number }>();

  // Activated users in previous period
  const previousActivated = await db
    .prepare(
      `SELECT COUNT(DISTINCT u.id) as count FROM users u
       WHERE EXISTS (
         SELECT 1 FROM files f WHERE f.user_id = u.id AND f.created_at < ?
       )
       AND u.created_at >= ? AND u.created_at < ?`
    )
    .bind(previousRange.end.toISOString(), previousRange.start.toISOString(), previousRange.end.toISOString())
    .first<{ count: number }>();

  // Paid users (users with plan_to_store containing 'pro') - placeholder logic
  // In production, this would check subscription status
  const paid = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE plan_to_store LIKE '%pro%'
       AND created_at >= ? AND created_at < ?`
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .first<{ count: number }>();

  const previousPaid = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE plan_to_store LIKE '%pro%'
       AND created_at >= ? AND created_at < ?`
    )
    .bind(previousRange.start.toISOString(), previousRange.end.toISOString())
    .first<{ count: number }>();

  return {
    registeredUsers: registered?.count ?? 0,
    activatedUsers: activated?.count ?? 0,
    paidUsers: paid?.count ?? 0,
    previousRegisteredUsers: previousRegistered?.count ?? 0,
    previousActivatedUsers: previousActivated?.count ?? 0,
    previousPaidUsers: previousPaid?.count ?? 0,
  };
}

// Cumulative totals (all time up to end date)
export type TotalMetrics = {
  totalRegistered: number;
  totalActivated: number;
  totalPaid: number;
  totalFiles: number;
  totalMrr: number; // placeholder
};

export async function getTotalMetrics(range: DateRange): Promise<TotalMetrics> {
  const db = getDb();

  const totalRegistered = await db
    .prepare("SELECT COUNT(*) as count FROM users WHERE created_at < ?")
    .bind(range.end.toISOString())
    .first<{ count: number }>();

  const totalActivated = await db
    .prepare(
      `SELECT COUNT(DISTINCT u.id) as count FROM users u
       WHERE EXISTS (SELECT 1 FROM files f WHERE f.user_id = u.id)
       AND u.created_at < ?`
    )
    .bind(range.end.toISOString())
    .first<{ count: number }>();

  const totalPaid = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users 
       WHERE plan_to_store LIKE '%pro%'
       AND created_at < ?`
    )
    .bind(range.end.toISOString())
    .first<{ count: number }>();

  const totalFiles = await db
    .prepare("SELECT COUNT(*) as count FROM files WHERE created_at < ?")
    .bind(range.end.toISOString())
    .first<{ count: number }>();

  // MRR placeholder ($9/month per pro user)
  const mrr = (totalPaid?.count ?? 0) * 9;

  return {
    totalRegistered: totalRegistered?.count ?? 0,
    totalActivated: totalActivated?.count ?? 0,
    totalPaid: totalPaid?.count ?? 0,
    totalFiles: totalFiles?.count ?? 0,
    totalMrr: mrr,
  };
}

// Conversion rates
export type ConversionRates = {
  registeredToActivated: number;
  activatedToPaid: number;
  registeredToPaid: number;
  previousRegisteredToActivated: number;
  previousActivatedToPaid: number;
  previousRegisteredToPaid: number;
};

export async function getConversionRates(range: DateRange): Promise<ConversionRates> {
  const db = getDb();
  const previousRange = getPreviousDateRange(range);

  // Get cohort users for current period
  const cohortUsers = await db
    .prepare(
      `SELECT u.id FROM users u WHERE u.created_at >= ? AND u.created_at < ?`
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .all<{ id: string }>();

  const cohortIds = cohortUsers.results?.map((r) => r.id) ?? [];
  const cohortCount = cohortIds.length;

  // Activated from cohort
  const activatedCount = cohortCount > 0
    ? (await db
        .prepare(
          `SELECT COUNT(DISTINCT u.id) as count FROM users u
           WHERE EXISTS (SELECT 1 FROM files f WHERE f.user_id = u.id)
           AND u.id IN (${cohortIds.map(() => "?").join(",") || "''"})`)
        .bind(...cohortIds)
        .first<{ count: number }>())?.count ?? 0
    : 0;

  // Paid from cohort
  const paidCount = cohortCount > 0
    ? (await db
        .prepare(
          `SELECT COUNT(*) as count FROM users
           WHERE plan_to_store LIKE '%pro%'
           AND id IN (${cohortIds.map(() => "?").join(",") || "''"})`)
        .bind(...cohortIds)
        .first<{ count: number }>())?.count ?? 0
    : 0;

  // Previous period cohort
  const prevCohortUsers = await db
    .prepare(
      `SELECT u.id FROM users u WHERE u.created_at >= ? AND u.created_at < ?`
    )
    .bind(previousRange.start.toISOString(), previousRange.end.toISOString())
    .all<{ id: string }>();

  const prevCohortIds = prevCohortUsers.results?.map((r) => r.id) ?? [];
  const prevCohortCount = prevCohortIds.length;

  const prevActivatedCount = prevCohortCount > 0
    ? (await db
        .prepare(
          `SELECT COUNT(DISTINCT u.id) as count FROM users u
           WHERE EXISTS (SELECT 1 FROM files f WHERE f.user_id = u.id)
           AND u.id IN (${prevCohortIds.map(() => "?").join(",") || "''"})`)
        .bind(...prevCohortIds)
        .first<{ count: number }>())?.count ?? 0
    : 0;

  const prevPaidCount = prevCohortCount > 0
    ? (await db
        .prepare(
          `SELECT COUNT(*) as count FROM users
           WHERE plan_to_store LIKE '%pro%'
           AND id IN (${prevCohortIds.map(() => "?").join(",") || "''"})`)
        .bind(...prevCohortIds)
        .first<{ count: number }>())?.count ?? 0
    : 0;

  return {
    registeredToActivated: cohortCount > 0 ? (activatedCount / cohortCount) * 100 : 0,
    activatedToPaid: activatedCount > 0 ? (paidCount / activatedCount) * 100 : 0,
    registeredToPaid: cohortCount > 0 ? (paidCount / cohortCount) * 100 : 0,
    previousRegisteredToActivated: prevCohortCount > 0 ? (prevActivatedCount / prevCohortCount) * 100 : 0,
    previousActivatedToPaid: prevActivatedCount > 0 ? (prevPaidCount / prevActivatedCount) * 100 : 0,
    previousRegisteredToPaid: prevCohortCount > 0 ? (prevPaidCount / prevCohortCount) * 100 : 0,
  };
}

// User funnel data (daily breakdown for chart)
export type FunnelDataPoint = {
  date: string;
  registered: number;
  activated: number;
  paid: number;
};

export async function getFunnelData(range: DateRange): Promise<FunnelDataPoint[]> {
  const db = getDb();
  const data: FunnelDataPoint[] = [];

  // Generate daily data points
  const current = new Date(range.start);
  while (current < range.end) {
    const dayStart = current.toISOString().split("T")[0];
    const nextDay = new Date(current);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayEnd = nextDay.toISOString().split("T")[0];

    const registered = await db
      .prepare(
        `SELECT COUNT(*) as count FROM users
         WHERE date(created_at) = ?`
      )
      .bind(dayStart)
      .first<{ count: number }>();

    const activated = await db
      .prepare(
        `SELECT COUNT(DISTINCT f.user_id) as count FROM files f
         JOIN users u ON u.id = f.user_id
         WHERE date(f.created_at) = ?`
      )
      .bind(dayStart)
      .first<{ count: number }>();

    const paid = await db
      .prepare(
        `SELECT COUNT(*) as count FROM users
         WHERE plan_to_store LIKE '%pro%'
         AND date(created_at) = ?`
      )
      .bind(dayStart)
      .first<{ count: number }>();

    data.push({
      date: dayStart,
      registered: registered?.count ?? 0,
      activated: activated?.count ?? 0,
      paid: paid?.count ?? 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}

// Growth segments (by signup source/plan)
export type GrowthSegment = {
  segment: string;
  registeredUsers: number;
  activatedUsers: number;
  paidUsers: number;
  activationRate: number;
  proConversionRate: number;
  registeredGrowth: number;
};

export async function getGrowthSegments(range: DateRange): Promise<GrowthSegment[]> {
  const db = getDb();
  const previousRange = getPreviousDateRange(range);

  // Group by plan_to_store (signup intent) as a proxy for segment
  const { results } = await db
    .prepare(
      `SELECT 
         COALESCE(plan_to_store, 'Other') as segment,
         COUNT(*) as registered
       FROM users
       WHERE created_at >= ? AND created_at < ?
       GROUP BY COALESCE(plan_to_store, 'Other')
       ORDER BY registered DESC
       LIMIT 10`
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .all<{ segment: string; registered: number }>();

  const segments: GrowthSegment[] = [];

  for (const row of results ?? []) {
    // Get activated count for segment
    const activated = await db
      .prepare(
        `SELECT COUNT(DISTINCT u.id) as count FROM users u
         WHERE EXISTS (SELECT 1 FROM files f WHERE f.user_id = u.id)
         AND COALESCE(u.plan_to_store, 'Other') = ?
         AND u.created_at >= ? AND u.created_at < ?`
      )
      .bind(row.segment, range.start.toISOString(), range.end.toISOString())
      .first<{ count: number }>();

    // Get paid count for segment
    const paid = await db
      .prepare(
        `SELECT COUNT(*) as count FROM users
         WHERE plan_to_store LIKE '%pro%'
         AND COALESCE(plan_to_store, 'Other') = ?
         AND created_at >= ? AND created_at < ?`
      )
      .bind(row.segment, range.start.toISOString(), range.end.toISOString())
      .first<{ count: number }>();

    // Get previous period registered for growth
    const prevRegistered = await db
      .prepare(
        `SELECT COUNT(*) as count FROM users
         WHERE COALESCE(plan_to_store, 'Other') = ?
         AND created_at >= ? AND created_at < ?`
      )
      .bind(row.segment, previousRange.start.toISOString(), previousRange.end.toISOString())
      .first<{ count: number }>();

    const activatedCount = activated?.count ?? 0;
    const paidCount = paid?.count ?? 0;
    const prevCount = prevRegistered?.count ?? 0;

    segments.push({
      segment: row.segment || "Other",
      registeredUsers: row.registered,
      activatedUsers: activatedCount,
      paidUsers: paidCount,
      activationRate: row.registered > 0 ? (activatedCount / row.registered) * 100 : 0,
      proConversionRate: row.registered > 0 ? (paidCount / row.registered) * 100 : 0,
      registeredGrowth: prevCount > 0 ? ((row.registered - prevCount) / prevCount) * 100 : 0,
    });
  }

  return segments;
}

// Recent activity feed
export type ActivityItem = {
  id: string;
  type: "user_registered" | "file_created" | "upgraded_pro";
  email?: string;
  fileName?: string;
  timestamp: string;
};

export async function getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
  const db = getDb();
  const activities: ActivityItem[] = [];

  // Recent user registrations
  const { results: recentUsers } = await db
    .prepare(
      `SELECT id, email, created_at FROM users
       ORDER BY created_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<{ id: string; email: string; created_at: string }>();

  for (const user of recentUsers ?? []) {
    activities.push({
      id: `user-${user.id}`,
      type: "user_registered",
      email: user.email,
      timestamp: user.created_at,
    });
  }

  // Recent file creations
  const { results: recentFiles } = await db
    .prepare(
      `SELECT f.id, f.name, f.created_at, u.email FROM files f
       JOIN users u ON u.id = f.user_id
       ORDER BY f.created_at DESC LIMIT ?`
    )
    .bind(limit)
    .all<{ id: string; name: string; created_at: string; email: string }>();

  for (const file of recentFiles ?? []) {
    activities.push({
      id: `file-${file.id}`,
      type: "file_created",
      email: file.email,
      fileName: file.name,
      timestamp: file.created_at,
    });
  }

  // Sort by timestamp and take most recent
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// File mix analytics
export type FileMixMetrics = {
  totalFiles: number;
  markdownFiles: number;
  jsonFiles: number;
  totalSize: number;
  previousTotalFiles: number;
  previousMarkdownFiles: number;
  previousJsonFiles: number;
};

export async function getFileMixMetrics(range: DateRange): Promise<FileMixMetrics> {
  const db = getDb();
  const previousRange = getPreviousDateRange(range);

  const current = await db
    .prepare(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN type = 'md' THEN 1 ELSE 0 END) as markdown,
         SUM(CASE WHEN type = 'json' THEN 1 ELSE 0 END) as json,
         SUM(size) as total_size
       FROM files WHERE created_at < ?`
    )
    .bind(range.end.toISOString())
    .first<{ total: number; markdown: number; json: number; total_size: number }>();

  const previous = await db
    .prepare(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN type = 'md' THEN 1 ELSE 0 END) as markdown,
         SUM(CASE WHEN type = 'json' THEN 1 ELSE 0 END) as json
       FROM files WHERE created_at < ?`
    )
    .bind(previousRange.end.toISOString())
    .first<{ total: number; markdown: number; json: number }>();

  return {
    totalFiles: current?.total ?? 0,
    markdownFiles: current?.markdown ?? 0,
    jsonFiles: current?.json ?? 0,
    totalSize: current?.total_size ?? 0,
    previousTotalFiles: previous?.total ?? 0,
    previousMarkdownFiles: previous?.markdown ?? 0,
    previousJsonFiles: previous?.json ?? 0,
  };
}

// File mix over time
export type FileMixDataPoint = {
  date: string;
  markdown: number;
  json: number;
};

export async function getFileMixOverTime(range: DateRange): Promise<FileMixDataPoint[]> {
  const db = getDb();
  const data: FileMixDataPoint[] = [];

  const current = new Date(range.start);
  while (current < range.end) {
    const dayStart = current.toISOString().split("T")[0];

    const counts = await db
      .prepare(
        `SELECT 
           SUM(CASE WHEN type = 'md' THEN 1 ELSE 0 END) as markdown,
           SUM(CASE WHEN type = 'json' THEN 1 ELSE 0 END) as json
         FROM files WHERE date(created_at) = ?`
      )
      .bind(dayStart)
      .first<{ markdown: number; json: number }>();

    data.push({
      date: dayStart,
      markdown: counts?.markdown ?? 0,
      json: counts?.json ?? 0,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}

// Top filename patterns
export type FilenamePattern = {
  pattern: string;
  type: "md" | "json";
  count: number;
  share: number;
  trend: number;
};

export async function getTopFilenamePatterns(range: DateRange): Promise<FilenamePattern[]> {
  const db = getDb();
  const previousRange = getPreviousDateRange(range);

  // Get total file count for share calculation
  const total = await db
    .prepare("SELECT COUNT(*) as count FROM files WHERE created_at < ?")
    .bind(range.end.toISOString())
    .first<{ count: number }>();

  const totalCount = total?.count ?? 1;

  // Get top filenames/patterns
  const { results } = await db
    .prepare(
      `SELECT name, type, COUNT(*) as count
       FROM files WHERE created_at < ?
       GROUP BY name, type
       ORDER BY count DESC
       LIMIT 20`
    )
    .bind(range.end.toISOString())
    .all<{ name: string; type: "md" | "json"; count: number }>();

  const patterns: FilenamePattern[] = [];

  for (const row of results ?? []) {
    // Get previous count for trend
    const prev = await db
      .prepare(
        `SELECT COUNT(*) as count FROM files
         WHERE name = ? AND type = ? AND created_at < ?`
      )
      .bind(row.name, row.type, previousRange.end.toISOString())
      .first<{ count: number }>();

    const prevCount = prev?.count ?? 0;
    const trend = prevCount > 0 ? ((row.count - prevCount) / prevCount) * 100 : 0;

    patterns.push({
      pattern: row.name,
      type: row.type,
      count: row.count,
      share: (row.count / totalCount) * 100,
      trend,
    });
  }

  return patterns;
}

// AI file patterns detection
export type AIFilePattern = {
  pattern: string;
  description: string;
  count: number;
  percentage: number;
};

const AI_PATTERNS = [
  { pattern: "CLAUDE.md", regex: /^claude\.md$/i, description: "Claude configuration and context" },
  { pattern: "AGENTS.md", regex: /^agents\.md$/i, description: "Agent definitions and instructions" },
  { pattern: ".cursor/rules", regex: /^\.cursor\/rules/i, description: "Cursor IDE rules and guidelines" },
  { pattern: "MEMORY.md", regex: /^memory\.md$/i, description: "Long-term memory and context" },
  { pattern: "agent-config.json", regex: /^agent-config\.json$/i, description: "Agent configuration files" },
  { pattern: "Chat exports", regex: /^chat[-_]?export/i, description: "Exported conversations and threads" },
];

export async function getAIFilePatterns(): Promise<{
  patterns: AIFilePattern[];
  totalRepos: number;
  insights: string[];
  opportunities: string[];
}> {
  const db = getDb();

  // Get total unique users (as proxy for repos)
  const totalUsers = await db
    .prepare("SELECT COUNT(DISTINCT user_id) as count FROM files")
    .first<{ count: number }>();

  const totalRepos = totalUsers?.count ?? 1;
  const patterns: AIFilePattern[] = [];

  for (const aiPattern of AI_PATTERNS) {
    // Count files matching pattern
    const count = await db
      .prepare(
        `SELECT COUNT(DISTINCT user_id) as count FROM files
         WHERE LOWER(name) LIKE ? OR LOWER(name) LIKE ?`
      )
      .bind(
        aiPattern.pattern.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        `%${aiPattern.pattern.toLowerCase()}%`
      )
      .first<{ count: number }>();

    patterns.push({
      pattern: aiPattern.pattern,
      description: aiPattern.description,
      count: count?.count ?? 0,
      percentage: totalRepos > 0 ? ((count?.count ?? 0) / totalRepos) * 100 : 0,
    });
  }

  // Sort by count descending
  patterns.sort((a, b) => b.count - a.count);

  // Generate insights
  const insights: string[] = [];
  const topPattern = patterns[0];
  if (topPattern && topPattern.count > 0) {
    insights.push(`${topPattern.pattern} is the most common AI file pattern`);
  }

  const agentsPattern = patterns.find((p) => p.pattern === "AGENTS.md");
  if (agentsPattern && agentsPattern.count > 0) {
    insights.push("Agent instructions are widely adopted across users");
  }

  const cursorPattern = patterns.find((p) => p.pattern.includes(".cursor"));
  if (cursorPattern && cursorPattern.count > 0) {
    insights.push("Cursor-specific rules are growing in popularity");
  }

  // Generate opportunities
  const opportunities: string[] = [
    "Build tools for Claude/AGENTS.md management",
    "Improve .cursor/rules generation and validation",
    "Support structured memory file workflows",
    "Expand chat export analysis and summarization",
  ];

  return {
    patterns,
    totalRepos,
    insights,
    opportunities,
  };
}

// Funnel page data
export type FunnelStageData = {
  registered: number;
  activated: number;
  paid: number;
  registeredToActivated: number;
  activatedToPaid: number;
  registeredToPaid: number;
};

export async function getFunnelStageData(range: DateRange): Promise<{
  current: FunnelStageData;
  previous: FunnelStageData;
}> {
  const db = getDb();
  const previousRange = getPreviousDateRange(range);

  // Current period
  const registered = await db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at < ?"
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .first<{ count: number }>();

  const activated = await db
    .prepare(
      `SELECT COUNT(DISTINCT u.id) as count FROM users u
       WHERE EXISTS (SELECT 1 FROM files f WHERE f.user_id = u.id)
       AND u.created_at >= ? AND u.created_at < ?`
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .first<{ count: number }>();

  const paid = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users
       WHERE plan_to_store LIKE '%pro%'
       AND created_at >= ? AND created_at < ?`
    )
    .bind(range.start.toISOString(), range.end.toISOString())
    .first<{ count: number }>();

  // Previous period
  const prevRegistered = await db
    .prepare(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at < ?"
    )
    .bind(previousRange.start.toISOString(), previousRange.end.toISOString())
    .first<{ count: number }>();

  const prevActivated = await db
    .prepare(
      `SELECT COUNT(DISTINCT u.id) as count FROM users u
       WHERE EXISTS (SELECT 1 FROM files f WHERE f.user_id = u.id)
       AND u.created_at >= ? AND u.created_at < ?`
    )
    .bind(previousRange.start.toISOString(), previousRange.end.toISOString())
    .first<{ count: number }>();

  const prevPaid = await db
    .prepare(
      `SELECT COUNT(*) as count FROM users
       WHERE plan_to_store LIKE '%pro%'
       AND created_at >= ? AND created_at < ?`
    )
    .bind(previousRange.start.toISOString(), previousRange.end.toISOString())
    .first<{ count: number }>();

  const regCount = registered?.count ?? 0;
  const actCount = activated?.count ?? 0;
  const paidCount = paid?.count ?? 0;

  const prevRegCount = prevRegistered?.count ?? 0;
  const prevActCount = prevActivated?.count ?? 0;
  const prevPaidCount = prevPaid?.count ?? 0;

  return {
    current: {
      registered: regCount,
      activated: actCount,
      paid: paidCount,
      registeredToActivated: regCount > 0 ? (actCount / regCount) * 100 : 0,
      activatedToPaid: actCount > 0 ? (paidCount / actCount) * 100 : 0,
      registeredToPaid: regCount > 0 ? (paidCount / regCount) * 100 : 0,
    },
    previous: {
      registered: prevRegCount,
      activated: prevActCount,
      paid: prevPaidCount,
      registeredToActivated: prevRegCount > 0 ? (prevActCount / prevRegCount) * 100 : 0,
      activatedToPaid: prevActCount > 0 ? (prevPaidCount / prevActCount) * 100 : 0,
      registeredToPaid: prevRegCount > 0 ? (prevPaidCount / prevRegCount) * 100 : 0,
    },
  };
}
