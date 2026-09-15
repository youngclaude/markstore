import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { ApiKeysPanel } from "@/components/api-keys-panel";
import { SettingsIcon } from "@/components/icons";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function SettingsPage() {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will handle missing secret */
  }
  const session = await auth();
  const email = session?.user?.email ?? "unknown";

  return (
    <AppShell email={email} activeFolder="__settings__">
      <header className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
          <SettingsIcon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage API keys for agent access to your files.
          </p>
        </div>
      </header>
      <section className="flex-1 px-6 py-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          API keys
        </h2>
        <ApiKeysPanel />
        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-slate-500">
          Use <code className="text-slate-400">Authorization: Bearer msk_…</code> against{" "}
          <code className="text-slate-400">/api/v1/files</code>. The full secret is shown only once
          at creation; we store a SHA-256 hash.
        </p>
      </section>
    </AppShell>
  );
}
