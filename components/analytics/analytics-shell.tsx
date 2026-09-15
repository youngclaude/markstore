import Link from "next/link";
import { Logo } from "@/components/logo";
import { signOut } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import {
  ChartIcon,
  FunnelIcon,
  PieChartIcon,
  BrainIcon,
  CalendarIcon,
  ChevronDownIcon,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/app/analytics",
    label: "Overview",
    icon: <ChartIcon className="h-4 w-4" />,
  },
  {
    href: "/app/analytics/funnel",
    label: "Funnel",
    icon: <FunnelIcon className="h-4 w-4" />,
  },
  {
    href: "/app/analytics/files",
    label: "File Mix",
    icon: <PieChartIcon className="h-4 w-4" />,
  },
  {
    href: "/app/analytics/ai-patterns",
    label: "AI Patterns",
    icon: <BrainIcon className="h-4 w-4" />,
  },
];

type AnalyticsShellProps = {
  email: string;
  children: React.ReactNode;
  activePath?: string;
  dateRange?: string;
};

export function AnalyticsShell({
  email,
  children,
  activePath = "/app/analytics",
  dateRange = "Last 7 days",
}: AnalyticsShellProps) {
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800/80 bg-[#0A0C12]">
        <div className="border-b border-slate-800/80 px-4 py-4">
          <Logo href="/app" />
        </div>
        <nav className="flex-1 px-3 py-4">
          <Link
            href="/app"
            className="mb-4 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 6 9 12l6 6" />
            </svg>
            <span>Back to app</span>
          </Link>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Founder Analytics
          </p>
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                  isActive
                    ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <span className={isActive ? "text-[#4F9DFF]" : "text-slate-500"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800/80 p-3">
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7BFF]/25 text-xs font-semibold text-cyan-100">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-100">{email}</p>
              <p className="text-[10px] text-slate-500">Founder · Admin</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              resolveAuthSecret();
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar with date range selector */}
        <header className="flex items-center justify-between border-b border-slate-800/80 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D7BFF]/15 text-[#4F9DFF]">
              <ChartIcon className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Founder analytics</h1>
              <p className="text-xs text-slate-500">
                Track product growth, user activation and revenue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800">
              <CalendarIcon className="h-4 w-4 text-slate-500" />
              <span>{dateRange}</span>
              <ChevronDownIcon className="h-4 w-4 text-slate-500" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7BFF]/25 text-xs font-semibold text-cyan-100">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
