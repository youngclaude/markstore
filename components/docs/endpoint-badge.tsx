interface EndpointBadgeProps {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description?: string;
}

const methodColors = {
  GET: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  POST: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PATCH: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-300 border-red-500/30",
};

export function EndpointBadge({ method, path, description }: EndpointBadgeProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3 hover:bg-slate-900/40 transition-colors">
      <span
        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${methodColors[method]}`}
      >
        {method}
      </span>
      <div className="min-w-0 flex-1">
        <code className="text-sm text-slate-200">{path}</code>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
    </div>
  );
}

export function EndpointList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
