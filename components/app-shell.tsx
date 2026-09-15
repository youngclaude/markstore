import Link from "next/link";
import { Logo } from "@/components/logo";
import { FolderIcon, GridIcon, SettingsIcon, CreditCardIcon } from "@/components/icons";
import { GlobalSearch } from "@/components/global-search";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";
import { signOut } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";

function BellIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChartIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 4 5-6" />
    </svg>
  );
}

export function AppShell({
  email,
  children,
  activeFolder = DEFAULT_FOLDER_NAME,
  isAdmin = false,
}: {
  email: string;
  children: React.ReactNode;
  activeFolder?: string;
  isAdmin?: boolean;
}) {
  const initials = email.slice(0, 2).toUpperCase();
  const settingsActive = activeFolder === "__settings__";
  const billingActive = activeFolder === "__billing__";
  const analyticsActive = activeFolder === "__analytics__";

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800/80 bg-[#0A0C12]">
        <div className="border-b border-slate-800/80 px-4 py-4">
          <Logo href="/app" />
        </div>
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>
          <Link
            href="/app/projects"
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
              activeFolder === "__projects__"
                ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <GridIcon className="h-4 w-4 text-[#4F9DFF]" />
            <span className="truncate">Projects</span>
          </Link>
          <Link
            href="/app"
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
              !settingsActive && !billingActive && !analyticsActive && activeFolder === DEFAULT_FOLDER_NAME
                ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <FolderIcon className="h-4 w-4 text-[#4F9DFF]" />
            <span className="truncate">General Files</span>
          </Link>
          <p className="mb-2 mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>
          <Link
            href="/app/settings"
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
              settingsActive
                ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <SettingsIcon className="h-4 w-4 text-[#4F9DFF]" />
            <span className="truncate">Settings</span>
          </Link>
          <Link
            href="/app/settings/billing"
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
              billingActive
                ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <CreditCardIcon className="h-4 w-4 text-[#4F9DFF]" />
            <span className="truncate">Billing</span>
          </Link>
          {isAdmin && (
            <>
              <p className="mb-2 mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Admin Only
              </p>
              <Link
                href="/app/analytics"
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
                  analyticsActive
                    ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <ChartIcon className="h-4 w-4 text-[#4F9DFF]" />
                <span className="truncate">Founder analytics</span>
              </Link>
            </>
          )}
        </nav>
        <div className="border-t border-slate-800/80 p-3">
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7BFF]/25 text-xs font-semibold text-cyan-100">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-100">{email}</p>
              <p className="text-[10px] text-slate-500">{isAdmin ? "Founder · Admin" : "Signed in"}</p>
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
        <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 bg-[#0A0C12]/80 px-6 py-3">
          <GlobalSearch />
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
              <BellIcon className="h-5 w-5" />
            </button>
            <Link
              href="/app/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D7BFF]/25 text-xs font-semibold text-cyan-100 transition-colors hover:bg-[#1D7BFF]/35"
            >
              {initials}
            </Link>
          </div>
        </header>
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
