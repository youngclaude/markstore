"use client";

import { useCallback, useEffect, useState } from "react";

type ApiKeyPublic = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKeyPublic[]>([]);
  const [name, setName] = useState("Agent key");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/keys");
      const data = (await res.json()) as { keys?: ApiKeyPublic[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load keys");
      setKeys(data.keys ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setRevealed(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await res.json()) as {
        secret?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Create failed");
      setRevealed(data.secret ?? null);
      setName("Agent key");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke(id: string) {
    if (!confirm("Revoke this API key? Agents using it will stop working.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Revoke failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onCreate}
        className="flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1 text-sm">
          <span className="mb-1.5 block text-xs font-medium text-slate-400">Key name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-[#1D7BFF]"
            placeholder="Agent key"
            maxLength={80}
            disabled={busy}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110 disabled:opacity-60"
        >
          Create key
        </button>
      </form>

      {revealed ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-sm font-medium text-amber-100">
            Copy your secret now — it won&apos;t be shown again.
          </p>
          <code className="mt-2 block break-all rounded-xl bg-slate-950/80 px-3 py-2.5 font-mono text-sm text-cyan-200">
            {revealed}
          </code>
          <button
            type="button"
            className="mt-3 text-xs text-amber-200/80 underline hover:text-amber-100"
            onClick={() => {
              void navigator.clipboard?.writeText(revealed);
            }}
          >
            Copy to clipboard
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
        <div className="grid grid-cols-[minmax(0,1.2fr)_140px_160px_160px_100px] gap-2 border-b border-slate-800/80 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
          <span>Name</span>
          <span>Prefix</span>
          <span>Created</span>
          <span>Last used</span>
          <span />
        </div>
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No API keys yet. Create one for agent access.
          </p>
        ) : (
          <ul>
            {keys.map((k) => (
              <li
                key={k.id}
                className="grid grid-cols-[minmax(0,1.2fr)_140px_160px_160px_100px] items-center gap-2 border-b border-slate-800/50 px-4 py-3 text-sm"
              >
                <span className="truncate font-medium text-slate-100">
                  {k.name}
                  {k.revoked_at ? (
                    <span className="ml-2 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-red-300">
                      Revoked
                    </span>
                  ) : null}
                </span>
                <code className="font-mono text-xs text-slate-400">{k.key_prefix}…</code>
                <span className="text-slate-400">{fmt(k.created_at)}</span>
                <span className="text-slate-400">{fmt(k.last_used_at)}</span>
                <span className="text-right">
                  {!k.revoked_at ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void onRevoke(k.id)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-red-400/50 hover:text-red-200 disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  ) : (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
