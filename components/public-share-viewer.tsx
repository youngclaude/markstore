import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";
import { highlightJson } from "@/lib/json-highlight";
import { formatBytes } from "@/lib/files-shared";
import { DocIcon, JsonIcon, MdIcon, GlobeIcon } from "@/components/icons";
import type { FileType } from "@/lib/files-shared";

export function PublicShareNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0e14] px-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D7BFF]/10">
          <GlobeIcon className="h-6 w-6 text-[#1D7BFF]" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">MarkStore</span>
      </div>

      <div className="max-w-md rounded-2xl border border-slate-800/80 bg-slate-950/60 p-8 text-center">
        <h1 className="mb-2 text-xl font-semibold text-slate-100">Share not found</h1>
        <p className="mb-6 text-sm text-slate-400">
          This shared file doesn't exist, was revoked, or the link is invalid.
        </p>

        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
        >
          Start storing →
        </Link>
      </div>
    </div>
  );
}

export function PublicShareViewer({
  name,
  type,
  content,
  size,
}: {
  name: string;
  type: FileType;
  content: string;
  size: number;
}) {
  const Icon = type === "md" ? MdIcon : JsonIcon;

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0e14]">
      <header className="border-b border-slate-800/80 px-5 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D7BFF]/10">
                <GlobeIcon className="h-4 w-4 text-[#1D7BFF]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">MarkStore</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-400">Shared file</span>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D7BFF] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
          >
            Start storing →
          </Link>
        </div>
      </header>

      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60">
              <Icon className="h-5 w-5 text-[#4F9DFF]" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-100">{name}</h1>
              <p className="text-xs text-slate-500">
                {type === "md" ? "Markdown" : "JSON"} · {formatBytes(size)} · Read-only
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60">
            {type === "md" ? (
              <div
                className="markdown-preview px-8 py-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : (
              <pre
                className="json-preview overflow-auto px-6 py-5 font-mono text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightJson(content) }}
              />
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="mb-2 text-sm text-slate-500">
              Store your own Markdown &amp; JSON files for AI agents
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4F9DFF] hover:text-[#1D7BFF]"
            >
              <DocIcon className="h-4 w-4" />
              Create a free account →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
