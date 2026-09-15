"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertIcon,
  CloseIcon,
  DocIcon,
  JsonIcon,
  UploadCloudIcon,
} from "@/components/icons";
import { DEFAULT_FOLDER_NAME, type FileType } from "@/lib/files-shared";

const REJECT_MSG = "Only Markdown (.md) and JSON (.json) files are supported.";

type RowStatus = "uploading" | "done" | "error" | "rejected" | "cancelled";

type UploadRow = {
  id: string;
  name: string;
  size: number;
  type: FileType | null;
  status: RowStatus;
  progress: number;
  error?: string;
};

function fileTypeFromName(name: string): FileType | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".md")) return "md";
  if (lower.endsWith(".json")) return "json";
  return null;
}

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsText(file);
  });
}

export function FileUploadZone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<Map<string, AbortController>>(new Map());
  const dragDepth = useRef(0);

  const [dragOver, setDragOver] = useState(false);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const updateRow = useCallback((id: string, patch: Partial<UploadRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const dismissRow = useCallback((id: string) => {
    abortRef.current.get(id)?.abort();
    abortRef.current.delete(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const showRejectToast = useCallback(() => {
    setToast(REJECT_MSG);
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  const uploadOne = useCallback(
    async (file: File, id: string, type: FileType) => {
      const ac = new AbortController();
      abortRef.current.set(id, ac);
      try {
        updateRow(id, { status: "uploading", progress: 12 });
        const content = await readFileText(file);
        if (ac.signal.aborted) return;
        updateRow(id, { progress: 45 });

        const tick = window.setInterval(() => {
          setRows((prev) =>
            prev.map((r) =>
              r.id === id && r.status === "uploading" && r.progress < 88
                ? { ...r, progress: Math.min(88, r.progress + 7) }
                : r,
            ),
          );
        }, 120);

        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            name: file.name,
            type,
            content,
            folderName: DEFAULT_FOLDER_NAME,
          }),
        });
        window.clearInterval(tick);

        const data = (await res.json()) as { error?: string; ok?: boolean };
        if (!res.ok) {
          updateRow(id, {
            status: "error",
            progress: 100,
            error: data.error ?? "Upload failed.",
          });
          return;
        }
        updateRow(id, { status: "done", progress: 100 });
      } catch (err) {
        if (ac.signal.aborted) {
          updateRow(id, { status: "cancelled", progress: 0 });
          return;
        }
        updateRow(id, {
          status: "error",
          progress: 100,
          error: err instanceof Error ? err.message : "Upload failed.",
        });
      } finally {
        abortRef.current.delete(id);
      }
    },
    [updateRow],
  );

  const handleFiles = useCallback(
    async (list: FileList | File[]) => {
      const files = Array.from(list);
      if (!files.length) return;

      const accepted: { file: File; id: string; type: FileType }[] = [];
      const rejected: UploadRow[] = [];
      let hadReject = false;

      for (const file of files) {
        const type = fileTypeFromName(file.name);
        const id = crypto.randomUUID();
        if (!type) {
          hadReject = true;
          rejected.push({
            id,
            name: file.name,
            size: file.size,
            type: null,
            status: "rejected",
            progress: 0,
            error: REJECT_MSG,
          });
          continue;
        }
        accepted.push({ file, id, type });
      }

      if (hadReject) showRejectToast();

      const pendingRows: UploadRow[] = [
        ...rejected,
        ...accepted.map(({ file, id, type }) => ({
          id,
          name: file.name,
          size: file.size,
          type,
          status: "uploading" as const,
          progress: 0,
        })),
      ];
      setRows((prev) => [...pendingRows, ...prev]);

      await Promise.all(accepted.map(({ file, id, type }) => uploadOne(file, id, type)));

      if (accepted.length) {
        router.refresh();
        window.setTimeout(() => {
          setRows((prev) => prev.filter((r) => r.status !== "done"));
        }, 900);
      }
    },
    [router, showRejectToast, uploadOne],
  );

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragOver(false);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  const uploadingCount = rows.filter((r) => r.status === "uploading").length;
  const activeRows = rows.filter((r) => r.status !== "cancelled");

  return (
    <div className="mb-5 space-y-3">
      {toast ? (
        <div
          role="alert"
          className="fixed right-6 top-6 z-50 flex max-w-sm items-start gap-2 rounded-xl border border-red-500/40 bg-[#1a1014] px-4 py-3 text-sm text-red-200 shadow-xl shadow-black/40"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="flex-1">{toast}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setToast(null)}
            className="rounded p-0.5 text-red-300/70 hover:bg-red-500/10 hover:text-red-100"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-[#1D7BFF] bg-[#1D7BFF]/15 shadow-[inset_0_0_0_1px_rgba(29,123,255,0.35)]"
            : "border-[#1D7BFF]/45 bg-slate-950/30 hover:border-[#1D7BFF]/70 hover:bg-[#1D7BFF]/5"
        }`}
      >
        <span
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
            dragOver ? "bg-[#1D7BFF]/25 text-[#7BB6FF]" : "bg-[#1D7BFF]/15 text-[#4F9DFF]"
          }`}
        >
          <UploadCloudIcon className="h-6 w-6" />
        </span>

        {dragOver ? (
          <>
            <p className="text-base font-semibold text-[#7BB6FF]">Drop to upload</p>
            <p className="mt-1 text-sm text-[#4F9DFF]/90">Release to add files to {DEFAULT_FOLDER_NAME}</p>
          </>
        ) : (
          <>
            <p className="text-base font-semibold text-slate-100">Drop .md or .json files here</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#1D7BFF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
            >
              <DocIcon className="h-4 w-4" />
              Browse files
            </button>
            <p className="mt-3 text-xs text-slate-500">Markdown and JSON only</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".md,.json,text/markdown,application/json"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploadingCount > 0 ? (
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1D7BFF]/30 bg-[#1D7BFF]/10 px-3 py-1 text-xs font-medium text-[#7BB6FF]">
            <UploadCloudIcon className="h-3.5 w-3.5" />
            Uploading… {uploadingCount} file{uploadingCount === 1 ? "" : "s"}
          </span>
        </div>
      ) : null}

      {activeRows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
          <div className="border-b border-slate-800/80 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {uploadingCount > 0 ? "Uploading files" : "Upload activity"}
          </div>
          <ul>
            {activeRows.map((row) => {
              const isReject = row.status === "rejected";
              const isError = row.status === "error";
              return (
                <li
                  key={row.id}
                  className={`flex items-center gap-3 border-b border-slate-800/50 px-4 py-3 last:border-b-0 ${
                    isReject || isError ? "bg-red-500/5" : ""
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isReject || isError
                        ? "bg-red-500/15 text-red-300"
                        : row.type === "json"
                          ? "bg-teal-500/15 text-teal-300"
                          : "bg-violet-500/15 text-violet-300"
                    }`}
                  >
                    {isReject || isError ? (
                      <AlertIcon className="h-4 w-4" />
                    ) : row.type === "json" ? (
                      <JsonIcon className="h-4 w-4" />
                    ) : (
                      <DocIcon className="h-4 w-4" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="truncate text-sm font-medium text-slate-100">{row.name}</p>
                      <span className="shrink-0 text-[11px] text-slate-500">
                        {row.status === "rejected"
                          ? `Rejected · ${formatSize(row.size)}`
                          : row.status === "uploading"
                            ? row.type === "json"
                              ? "JSON"
                              : "Markdown"
                            : row.status === "done"
                              ? "Uploaded"
                              : row.status === "error"
                                ? "Failed"
                                : formatSize(row.size)}
                      </span>
                    </div>

                    {row.status === "uploading" ? (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-[#1D7BFF] transition-[width] duration-150"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-400">
                          {row.progress}%
                        </span>
                      </div>
                    ) : null}

                    {(isReject || isError) && row.error ? (
                      <p className="mt-1 text-xs text-red-300">{row.error}</p>
                    ) : null}
                  </div>

                  {row.status === "uploading" ? (
                    <button
                      type="button"
                      onClick={() => {
                        abortRef.current.get(row.id)?.abort();
                        updateRow(row.id, { status: "cancelled", progress: 0 });
                        dismissRow(row.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
                    >
                      <CloseIcon className="h-3 w-3" />
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Dismiss"
                      onClick={() => dismissRow(row.id)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                    >
                      <CloseIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
