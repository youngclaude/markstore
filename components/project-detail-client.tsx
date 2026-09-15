"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  DocIcon,
  FolderIcon,
  FolderPlusIcon,
  JsonIcon,
  PlusIcon,
  UploadCloudIcon,
  AlertIcon,
} from "@/components/icons";
import { DEFAULT_FOLDER_NAME, formatBytes, formatModified, type FileType } from "@/lib/files-shared";
import type { ProjectFolderRow, ProjectFileRow } from "@/lib/projects";

type FolderData = Omit<ProjectFolderRow, "user_id">;
type FileData = Pick<
  ProjectFileRow,
  "id" | "name" | "type" | "folder_id" | "folder_name" | "size" | "updated_at"
>;

export function ProjectDetailClient({
  projectId,
  projectName,
  folders,
  files,
  activeFolderId,
}: {
  projectId: string;
  projectName: string;
  folders: FolderData[];
  files: FileData[];
  activeFolderId?: string;
}) {
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(folders.map((f) => f.id)),
  );
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);

  const selectedFolder = activeFolderId
    ? folders.find((f) => f.id === activeFolderId)
    : folders.find((f) => f.name === DEFAULT_FOLDER_NAME) || folders[0];

  const displayedFiles = activeFolderId
    ? files.filter((f) => f.folder_id === activeFolderId)
    : files;

  function toggleFolder(folderId: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setFolderError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFolderError(data.error ?? "Could not create folder.");
        return;
      }
      setCreatingFolder(false);
      setNewFolderName("");
      router.refresh();
    } catch {
      setFolderError("Something went wrong.");
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-800/80 bg-slate-950/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Files
          </h3>
          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="New folder"
          >
            <FolderPlusIcon className="h-4 w-4" />
          </button>
        </div>

        {creatingFolder && (
          <form onSubmit={handleCreateFolder} className="mb-3">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#1D7BFF]"
            />
            {folderError && (
              <p className="mt-1 text-xs text-red-300">{folderError}</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="rounded bg-[#1D7BFF] px-2 py-1 text-xs font-medium text-white hover:brightness-110"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatingFolder(false);
                  setNewFolderName("");
                  setFolderError(null);
                }}
                className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <ul className="space-y-0.5">
          {folders.map((folder) => {
            const isExpanded = expandedFolders.has(folder.id);
            const isSelected = selectedFolder?.id === folder.id;
            const folderFiles = files.filter((f) => f.folder_id === folder.id);

            return (
              <li key={folder.id}>
                <div
                  className={`flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
                    isSelected
                      ? "bg-[#1D7BFF]/15 text-cyan-200"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    className="rounded p-0.5 hover:bg-slate-700"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRightIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <Link
                    href={`/app/projects/${projectId}?folder=${folder.id}`}
                    className="flex flex-1 items-center gap-1.5 truncate"
                  >
                    <FolderIcon className="h-4 w-4 shrink-0 text-[#4F9DFF]" />
                    <span className="truncate">{folder.name}</span>
                  </Link>
                </div>
                {isExpanded && folderFiles.length > 0 && (
                  <ul className="ml-5 mt-0.5 space-y-0.5">
                    {folderFiles.map((file) => (
                      <li key={file.id}>
                        <Link
                          href={`/app/files/${file.id}`}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        >
                          {file.type === "md" ? (
                            <DocIcon className="h-3.5 w-3.5 shrink-0 text-[#7BB6FF]" />
                          ) : (
                            <JsonIcon className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                          )}
                          <span className="truncate">{file.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FolderIcon className="h-5 w-5 text-[#4F9DFF]" />
            {selectedFolder?.name || "All Files"}
          </h2>
          <div className="flex gap-2">
            <ProjectUploadButton
              projectId={projectId}
              folderId={selectedFolder?.id}
            />
            <ProjectCreateButton
              projectId={projectId}
              folderId={selectedFolder?.id}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
          <div className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_180px] gap-2 border-b border-slate-800/80 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Modified</span>
          </div>

          {displayedFiles.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <p className="text-sm text-slate-400">
                No files yet in {selectedFolder?.name || "this folder"}.
              </p>
              <ProjectCreateButton
                projectId={projectId}
                folderId={selectedFolder?.id}
                variant="outline"
              />
            </div>
          ) : (
            <ul>
              {displayedFiles.map((file) => (
                <li key={file.id}>
                  <Link
                    href={`/app/files/${file.id}`}
                    className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_180px] gap-2 border-b border-slate-800/50 px-4 py-3 text-sm transition hover:bg-slate-900/60"
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate font-medium text-slate-100">
                      {file.type === "md" ? (
                        <DocIcon className="h-4 w-4 shrink-0 text-[#7BB6FF]" />
                      ) : (
                        <JsonIcon className="h-4 w-4 shrink-0 text-cyan-300" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </span>
                    <span>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          file.type === "md"
                            ? "bg-violet-500/15 text-violet-300"
                            : "bg-teal-500/15 text-teal-300"
                        }`}
                      >
                        {file.type === "md" ? "Markdown" : "JSON"}
                      </span>
                    </span>
                    <span className="text-slate-400">{formatBytes(file.size)}</span>
                    <span className="text-slate-400">{formatModified(file.updated_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectCreateButton({
  projectId,
  folderId,
  variant = "primary",
}: {
  projectId: string;
  folderId?: string;
  variant?: "primary" | "outline";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FileType>("md");
  const [name, setName] = useState("new-file");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          folderId,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        file?: { id: string };
      };
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

  if (!open) {
    return variant === "outline" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
      >
        <PlusIcon className="h-4 w-4" />
        Create your first file
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
      >
        <PlusIcon className="h-4 w-4" />
        Create
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-700/70 bg-[#0F131A] p-6 shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create file</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>
        <p className="mb-5 text-sm text-slate-400">
          Choose a file type and name.
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
            <DocIcon className="mb-2 h-5 w-5 text-[#4F9DFF]" />
            <p className="text-sm font-medium">Markdown (.md)</p>
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
          </button>
        </div>

        <label className="mt-5 block text-sm text-slate-300">
          Filename
          <span className="relative mt-1.5 block">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-3 pr-16 text-sm text-slate-100 outline-none focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40"
              placeholder="new-file"
              required
              disabled={pending}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              {type === "md" ? ".md" : ".json"}
            </span>
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
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
    </div>
  );
}

function ProjectUploadButton({
  projectId,
  folderId,
}: {
  projectId: string;
  folderId?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(list: FileList) {
    const files = Array.from(list);
    if (!files.length) return;

    setUploading(true);
    setError(null);

    for (const file of files) {
      const type = file.name.toLowerCase().endsWith(".json")
        ? "json"
        : file.name.toLowerCase().endsWith(".md")
          ? "md"
          : null;
      if (!type) {
        setError("Only .md and .json files are supported.");
        continue;
      }

      const content = await file.text();
      try {
        const res = await fetch(`/api/projects/${projectId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type,
            folderId,
            content,
          }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "Upload failed.");
        }
      } catch {
        setError("Upload failed.");
      }
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50"
      >
        <UploadCloudIcon className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.json"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && (
        <span className="text-xs text-red-300">{error}</span>
      )}
    </>
  );
}
