"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CodeIcon,
  DownloadIcon,
  EyeIcon,
  FolderIcon,
  HistoryIcon,
  PencilIcon,
  SaveIcon,
  TreeIcon,
} from "@/components/icons";
import { JsonTree } from "@/components/json-tree";
import { renderMarkdown } from "@/lib/markdown";
import type { FileType } from "@/lib/files-shared";
import { EditorPane, RawView } from "@/components/editor-panes";

type MdTab = "edit" | "preview" | "raw";
type JsonTab = "tree" | "raw";

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
  const [mdTab, setMdTab] = useState<MdTab>("edit");
  const [jsonTab, setJsonTab] = useState<JsonTab>("tree");
  const dirty = content !== savedContent;

  const lineCount = useMemo(() => Math.max(content.split("\n").length, 1), [content]);
  const previewHtml = useMemo(
    () => (type === "md" ? renderMarkdown(content) : ""),
    [content, type],
  );

  function validateBeforeSave(): string | null {
    if (type === "json") {
      try {
        JSON.parse(content);
      } catch (e) {
        return e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON";
      }
    }
    return null;
  }

  async function save() {
    const validation = validateBeforeSave();
    if (validation) {
      setStatus(validation);
      if (type === "json") setJsonTab("raw");
      return;
    }
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await res.json()) as { error?: string; file?: { version?: number } };
      if (!res.ok) {
        setStatus(data.error ?? "Save failed");
        setPending(false);
        return;
      }
      setSavedContent(content);
      setStatus(data.file?.version ? `Saved · v${data.file.version}` : "Saved");
      setPending(false);
    } catch {
      setStatus("Save failed");
      setPending(false);
    }
  }

  function download() {
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

  const tabBtn = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-[#1D7BFF]/20 text-cyan-100 ring-1 ring-[#1D7BFF]/40"
        : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`;

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
        <div className="flex flex-wrap items-center gap-2">
          {status ? <span className="text-xs text-slate-400">{status}</span> : null}
          <Link
            href={`/app/files/${fileId}/versions`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            <HistoryIcon />
            Version history
          </Link>
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
            Export
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-slate-800/80 px-4 py-2">
        {type === "md" ? (
          <>
            <button type="button" className={tabBtn(mdTab === "edit")} onClick={() => setMdTab("edit")}>
              <PencilIcon className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              className={tabBtn(mdTab === "preview")}
              onClick={() => setMdTab("preview")}
            >
              <EyeIcon className="h-3.5 w-3.5" />
              Preview
            </button>
            <button type="button" className={tabBtn(mdTab === "raw")} onClick={() => setMdTab("raw")}>
              <CodeIcon className="h-3.5 w-3.5" />
              Raw
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={tabBtn(jsonTab === "tree")}
              onClick={() => setJsonTab("tree")}
            >
              <TreeIcon className="h-3.5 w-3.5" />
              Tree
            </button>
            <button
              type="button"
              className={tabBtn(jsonTab === "raw")}
              onClick={() => setJsonTab("raw")}
            >
              <CodeIcon className="h-3.5 w-3.5" />
              Raw
            </button>
          </>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#0A0C12]">
        {type === "md" && mdTab === "preview" ? (
          <div
            className="markdown-preview h-full overflow-auto px-8 py-6"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : null}

        {type === "md" && mdTab === "raw" ? (
          <RawView content={content} lineCount={lineCount} />
        ) : null}

        {type === "md" && mdTab === "edit" ? (
          <EditorPane
            content={content}
            lineCount={lineCount}
            onChange={(v) => {
              setContent(v);
              if (status === "Saved" || status?.startsWith("Saved")) setStatus(null);
            }}
          />
        ) : null}

        {type === "json" && jsonTab === "tree" ? <JsonTree source={content} /> : null}

        {type === "json" && jsonTab === "raw" ? (
          <EditorPane
            content={content}
            lineCount={lineCount}
            onChange={(v) => {
              setContent(v);
              if (status) setStatus(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
