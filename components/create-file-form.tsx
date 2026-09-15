"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_FOLDER_NAME, type FileType } from "@/lib/files-shared";
import { FolderIcon, JsonIcon, MdIcon } from "@/components/icons";

export function CreateFileForm({
  defaultType = "md",
}: {
  defaultType?: FileType;
}) {
  const router = useRouter();
  const [type, setType] = useState<FileType>(defaultType);
  const [name, setName] = useState("new-file");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ext = type === "md" ? ".md" : ".json";
  const displayName = useMemo(() => {
    const base = name.replace(/\.(md|json)$/i, "");
    return base;
  }, [name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          type,
          folderName: DEFAULT_FOLDER_NAME,
        }),
      });
      const data = (await res.json()) as { error?: string; file?: { id: string } };
      if (!res.ok || !data.file) {
        setError(data.error ?? "Could not create file.");
        setPending(false);
        return;
      }
      router.push(`/app/files/${data.file.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-lg rounded-2xl border border-slate-700/70 bg-[#0F131A] p-6 shadow-2xl shadow-black/40"
    >
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Create file</h1>
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <p className="mb-5 text-sm text-slate-400">
        Choose a file type and name, then select the destination folder.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setType("md")}
          className={`rounded-xl border p-4 text-left transition ${
            type === "md"
              ? "border-[#1D7BFF] bg-[#1D7BFF]/10 ring-1 ring-[#1D7BFF]/40"
              : "border-slate-700 bg-slate-950/50 hover:border-slate-500"
          }`}
        >
          <MdIcon className="mb-2 h-5 w-5 text-[#4F9DFF]" />
          <p className="text-sm font-medium">Markdown (.md)</p>
          <p className="mt-1 text-xs text-slate-500">Plain text with Markdown formatting.</p>
        </button>
        <button
          type="button"
          onClick={() => setType("json")}
          className={`rounded-xl border p-4 text-left transition ${
            type === "json"
              ? "border-[#1D7BFF] bg-[#1D7BFF]/10 ring-1 ring-[#1D7BFF]/40"
              : "border-slate-700 bg-slate-950/50 hover:border-slate-500"
          }`}
        >
          <JsonIcon className="mb-2 h-5 w-5 text-cyan-300" />
          <p className="text-sm font-medium">JSON (.json)</p>
          <p className="mt-1 text-xs text-slate-500">Structured data in JSON format.</p>
        </button>
      </div>

      <label className="mt-5 block text-sm text-slate-300">
        Filename
        <span className="relative mt-1.5 block">
          <input
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-3 pr-16 text-sm text-slate-100 outline-none focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40"
            placeholder="new-file"
            required
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {ext}
          </span>
        </span>
      </label>

      <label className="mt-4 block text-sm text-slate-300">
        Destination
        <span className="mt-1.5 flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-3 text-sm text-slate-200">
          <FolderIcon className="h-4 w-4 text-[#4F9DFF]" />
          {DEFAULT_FOLDER_NAME}
        </span>
      </label>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#1D7BFF] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
