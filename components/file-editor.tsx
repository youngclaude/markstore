"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DownloadIcon, FolderIcon, SaveIcon } from "@/components/icons";
import type { FileType } from "@/lib/files-shared";

export function FileEditor({
  fileId,
  name,
  type,
  folderName,
  initialContent,
}: {
  fileId: string;
  name: string;
  type: FileType;
  folderName: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const dirty = content !== savedContent;

  const lineCount = useMemo(() => Math.max(content.split("\n").length, 1), [content]);

  async function save() {
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus(data.error ?? "Save failed");
        setPending(false);
        return;
      }
      setSavedContent(content);
      setStatus("Saved");
      setPending(false);
    } catch {
      setStatus("Save failed");
      setPending(false);
    }
  }

  function download() {
    // Prefer live editor content for export (ALL-17)
    const blob = new Blob([content], {
      type: type === "json" ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 px-5 py-3">
        <div className="min-w-0">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400">
            <FolderIcon className="h-3.5 w-3.5 text-[#4F9DFF]" />
            <Link href="/app" className="hover:text-slate-200">
              {folderName}
            </Link>
            <span className="text-slate-600">/</span>
            <span className="truncate font-medium text-slate-100">{name}</span>
          </nav>
          <p className="mt-0.5 text-xs text-slate-500">
            {type === "md" ? "Markdown" : "JSON"} editor
            {dirty ? " · unsaved changes" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status ? <span className="text-xs text-slate-400">{status}</span> : null}
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D7BFF] px-3 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SaveIcon />
            Save
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            <DownloadIcon />
            Export / Download
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0A0C12]">
        <div className="absolute inset-0 flex font-mono text-[13px] leading-6">
          <div
            aria-hidden
            className="select-none border-r border-slate-800/80 bg-[#080A0F] px-3 py-4 text-right text-slate-600"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (status === "Saved") setStatus(null);
            }}
            spellCheck={false}
            className="h-full w-full resize-none bg-transparent px-4 py-4 text-slate-100 outline-none"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  );
}
