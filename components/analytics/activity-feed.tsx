import type { ActivityItem } from "@/lib/analytics";

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  switch (type) {
    case "user_registered":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15 text-violet-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
        </div>
      );
    case "file_created":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M12 18v-6M9 15h6" />
          </svg>
        </div>
      );
    case "upgraded_pro":
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 4l3 12h14l3-12-6 6-4-8-4 8-6-6z" />
            <path d="M4 18h16v2H4z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-500/15 text-slate-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
      );
  }
}

function ActivityTitle({ item }: { item: ActivityItem }) {
  switch (item.type) {
    case "user_registered":
      return (
        <span>
          <span className="font-medium text-slate-200">New user registered</span>
        </span>
      );
    case "file_created":
      return (
        <span>
          <span className="font-medium text-slate-200">File created</span>
        </span>
      );
    case "upgraded_pro":
      return (
        <span>
          <span className="font-medium text-slate-200">Upgraded to Pro</span>
        </span>
      );
    default:
      return <span className="text-slate-200">Activity</span>;
  }
}

function ActivityDescription({ item }: { item: ActivityItem }) {
  if (item.type === "file_created" && item.fileName) {
    return (
      <p className="text-xs text-slate-500">
        {item.fileName}
      </p>
    );
  }
  if (item.email) {
    return (
      <p className="text-xs text-slate-500 truncate">
        {item.email}
      </p>
    );
  }
  return null;
}

type ActivityFeedProps = {
  activities: ActivityItem[];
  className?: string;
  showViewAll?: boolean;
};

export function ActivityFeed({ activities, className = "", showViewAll = false }: ActivityFeedProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">Recent activity</h3>
        {showViewAll && (
          <button className="text-xs text-blue-400 hover:text-blue-300">
            View all →
          </button>
        )}
      </div>
      <div className="space-y-1">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No recent activity</p>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-800/30"
            >
              <ActivityIcon type={item.type} />
              <div className="min-w-0 flex-1">
                <ActivityTitle item={item} />
                <ActivityDescription item={item} />
              </div>
              <span className="shrink-0 text-xs text-slate-600">
                {formatTimeAgo(item.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
