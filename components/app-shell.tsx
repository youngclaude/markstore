import Link from "next/link";
import { Logo } from "@/components/logo";
import { FolderIcon, SettingsIcon } from "@/components/icons";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";
import { signOut } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";

export function AppShell({
  email,
  children,
  activeFolder = DEFAULT_FOLDER_NAME,
}: {
  email: string;
  children: React.ReactNode;
  activeFolder?: string;
}) {
  const initials = email.slice(0, 2).toUpperCase();
  const settingsActive = activeFolder === "__settings__";

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800/80 bg-[#0A0C12]">
        <div className="border-b border-slate-800/80 px-4 py-4">
          <Logo href="/app" />
        </div>
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Projects
          </p>
          <Link
            href="/app"
            className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm ${
              !settingsActive && activeFolder === DEFAULT_FOLDER_NAME
                ? "bg-[#1D7BFF]/15 text-cyan-200 ring-1 ring-[#1D7BFF]/30"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <FolderIcon className="h-4 w-4 text-[#4F9DFF]" />
            <span className="truncate">{DEFAULT_FOLDER_NAME}</span>
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
        </nav>
        <div className="border-t border-slate-800/80 p-3">
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7BFF]/25 text-xs font-semibold text-cyan-100">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-100">{email}</p>
              <p className="text-[10px] text-slate-500">Signed in</p>
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
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
