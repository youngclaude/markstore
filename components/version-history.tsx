"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon, HistoryIcon, RestoreIcon } from "@/components/icons";
import { formatModified } from "@/lib/files-shared";
import { lineDiff, relativeTime, type DiffOp } from "@/lib/diff";

export type VersionMeta = {
  id: string;
  version: number;
  created_at: string;
  email?: string | null;
};

export function VersionHistory({
  fileId,
  fileName,
  folderName,
  versions,
  initialVersion,
  selectedContent,
  previousContent,
  previousVersion,
}: {
  fileId: string;
  fileName: string;
  folderName: string;
  versions: VersionMeta[];
  initialVersion: number | null;
  selectedContent: string;
  previousContent: string;
  previousVersion: number | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const currentVersion = versions[0]?.version ?? null;
  const selected = initialVersion ?? currentVersion;

  const ops = useMemo(
    () => lineDiff(previousContent, selectedContent),
    [previousContent, selectedContent],
  );

  async function restore() {
    if (selected == null) return;
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/files/${fileId}/versions/${selected}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = (await res.json()) as { error?: string; file?: { version?: number } };
      if (!res.ok) {
        setStatus(data.error ?? "Restore failed");
        setPending(false);
        return;
      }
      setStatus(data.file?.version ? `Restored as v${data.file.version}` : "Restored");
      setPending(false);
      router.push(`/app/files/${fileId}`);
      router.refresh();
    } catch {
      setStatus("Restore failed");
      setPending(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/app/files/${fileId}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            >
              <BackIcon className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-lg font-semibold text-slate-50">Compare versions</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {folderName} / {fileName}
            {selected != null ? (
              <span className="text-slate-500">
                {" "}
                · viewing v{selected}
                {previousVersion != null ? ` vs v${previousVersion}` : " (first version)"}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status ? <span className="text-xs text-slate-400">{status}</span> : null}
          <button
            type="button"
            onClick={restore}
            disabled={pending || selected == null || selected === currentVersion}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D7BFF] px-3 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RestoreIcon />
            Restore this version
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-slate-800/80 bg-[#0A0C12]">
          <div className="border-b border-slate-800/80 px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <HistoryIcon className="h-3.5 w-3.5" />
              Versions
            </p>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {versions.length === 0 ? (
              <p className="px-2 py-4 text-sm text-slate-500">No versions yet. Save the file to create one.</p>
            ) : (
              versions.map((v) => {
                const active = v.version === selected;
                const isCurrent = v.version === currentVersion;
                return (
                  <Link
                    key={v.id}
                    href={`/app/files/${fileId}/versions?v=${v.version}`}
                    className={`mb-1 block rounded-lg border px-3 py-2.5 transition ${
                      active
                        ? "border-[#1D7BFF]/50 bg-[#1D7BFF]/10"
                        : "border-transparent hover:border-slate-800 hover:bg-slate-950/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-100">v{v.version}</span>
                      {isCurrent ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                          Current
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                          {relativeTime(v.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatModified(v.created_at)}</p>
                    {v.email ? (
                      <p className="mt-0.5 truncate text-xs text-slate-400">{v.email}</p>
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto bg-[#080A0F] p-4">
          {selected == null ? (
            <p className="text-sm text-slate-500">Select a version to compare.</p>
          ) : (
            <DiffPane
              ops={ops}
              label={
                previousVersion != null
                  ? `v${previousVersion} → v${selected}`
                  : `v${selected} (initial)`
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}

function DiffPane({ ops, label }: { ops: DiffOp[]; label: string }) {
  const adds = ops.filter((o) => o.type === "add").length;
  const removes = ops.filter((o) => o.type === "remove").length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0A0C12]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2.5">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500">
          <span className="text-emerald-400">+{adds}</span>
          {" · "}
          <span className="text-rose-400">−{removes}</span>
        </p>
      </div>
      <div className="overflow-auto font-mono text-[12.5px] leading-6">
        {ops.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No changes vs previous version.</p>
        ) : (
          ops.map((op, i) => {
            if (op.type === "equal") {
              return (
                <div key={i} className="flex text-slate-400">
                  <span className="w-12 shrink-0 select-none border-r border-slate-800/80 px-2 text-right text-slate-600">
                    {op.oldLine}
                  </span>
                  <span className="w-12 shrink-0 select-none border-r border-slate-800/80 px-2 text-right text-slate-600">
                    {op.newLine}
                  </span>
                  <span className="w-6 shrink-0 select-none text-center text-slate-600"> </span>
                  <span className="flex-1 whitespace-pre-wrap px-2">{op.line || " "}</span>
                </div>
              );
            }
            if (op.type === "add") {
              return (
                <div key={i} className="flex bg-emerald-500/10 text-emerald-200">
                  <span className="w-12 shrink-0 select-none border-r border-emerald-900/40 px-2 text-right text-emerald-700/80">
                    {" "}
                  </span>
                  <span className="w-12 shrink-0 select-none border-r border-emerald-900/40 px-2 text-right text-emerald-600/90">
                    {op.newLine}
                  </span>
                  <span className="w-6 shrink-0 select-none text-center text-emerald-400">+</span>
                  <span className="flex-1 whitespace-pre-wrap px-2">{op.line || " "}</span>
                </div>
              );
            }
            return (
              <div key={i} className="flex bg-rose-500/10 text-rose-200">
                <span className="w-12 shrink-0 select-none border-r border-rose-900/40 px-2 text-right text-rose-600/90">
                  {op.oldLine}
                </span>
                <span className="w-12 shrink-0 select-none border-r border-rose-900/40 px-2 text-right text-rose-700/80">
                  {" "}
                </span>
                <span className="w-6 shrink-0 select-none text-center text-rose-400">−</span>
                <span className="flex-1 whitespace-pre-wrap px-2">{op.line || " "}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
