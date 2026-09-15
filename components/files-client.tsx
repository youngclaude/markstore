"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderTree } from "@/components/folder-tree";
import { NewFolderModal } from "@/components/new-folder-modal";
import { RenameFolderModal } from "@/components/rename-folder-modal";
import { DeleteFolderModal } from "@/components/delete-folder-modal";
import { EmptyFolderState } from "@/components/empty-folder-state";
import {
  DocIcon,
  FolderIcon,
  FolderPlusIcon,
  JsonIcon,
  PlusIcon,
  UploadCloudIcon,
  CloseIcon,
} from "@/components/icons";
import { DEFAULT_FOLDER_NAME, formatBytes, formatModified, type FileType } from "@/lib/files-shared";
import type { FolderRow, FileRow } from "@/lib/db";

type FolderData = Pick<FolderRow, "id" | "name" | "parent_id">;
type FileData = Pick<FileRow, "id" | "name" | "type" | "folder_id" | "size" | "updated_at">;

interface FilesClientProps {
  folders: FolderData[];
  files: FileData[];
  selectedFolder: FolderData | null;
  activeFileId?: string;
}

export function FilesClient({
  folders,
  files,
  selectedFolder,
  activeFileId,
}: FilesClientProps) {
  const router = useRouter();
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState("");
  const [deleteFolderName, setDeleteFolderName] = useState("");
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [createFileInFolder, setCreateFileInFolder] = useState<string | undefined>();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const displayedFiles = selectedFolder
    ? files.filter((f) => f.folder_id === selectedFolder.id)
    : files;

  const handleCreateFolder = useCallback((parentId: string | null) => {
    setNewFolderParentId(parentId);
    setNewFolderOpen(true);
  }, []);

  const handleRenameFolder = useCallback((folderId: string, currentName: string) => {
    setRenameFolderId(folderId);
    setRenameFolderName(currentName);
    setRenameOpen(true);
  }, []);

  const handleDeleteFolder = useCallback((folderId: string, folderName: string) => {
    setDeleteFolderId(folderId);
    setDeleteFolderName(folderName);
    setDeleteOpen(true);
  }, []);

  const handleCreateFile = useCallback((folderId: string) => {
    setCreateFileInFolder(folderId);
    setCreateFileOpen(true);
  }, []);

  async function handleUpload(fileList: FileList) {
    const files = Array.from(fileList);
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);

    for (const file of files) {
      const type = file.name.toLowerCase().endsWith(".json")
        ? "json"
        : file.name.toLowerCase().endsWith(".md")
          ? "md"
          : null;
      if (!type) {
        setUploadError("Only .md and .json files are supported.");
        continue;
      }

      const content = await file.text();
      try {
        const res = await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            type,
            folderName: selectedFolder?.name,
            content,
          }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setUploadError(data.error ?? "Upload failed.");
        }
      } catch {
        setUploadError("Upload failed.");
      }
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-slate-800/80 bg-slate-950/30 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Folders
          </h3>
          <button
            type="button"
            onClick={() => handleCreateFolder(null)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            title="New folder"
          >
            <FolderPlusIcon className="h-4 w-4" />
          </button>
        </div>

        <FolderTree
          folders={folders}
          files={files}
          activeFolderId={selectedFolder?.id}
          activeFileId={activeFileId}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateFile={handleCreateFile}
        />
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <FolderIcon className="h-5 w-5 text-[#4F9DFF]" />
            {selectedFolder?.name || "All Files"}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50"
            >
              <UploadCloudIcon className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              accept=".md,.json"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => handleCreateFile(selectedFolder?.id || "")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
            >
              <PlusIcon className="h-4 w-4" />
              Create
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {uploadError}
          </div>
        )}

        {displayedFiles.length === 0 ? (
          <EmptyFolderState
            folderName={selectedFolder?.name || "All Files"}
            onCreateFile={() => handleCreateFile(selectedFolder?.id || "")}
            onUpload={() => uploadInputRef.current?.click()}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
            <div className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_180px] gap-2 border-b border-slate-800/80 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Modified</span>
            </div>

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
          </div>
        )}
      </main>

      <NewFolderModal
        open={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        folders={folders}
        defaultParentId={newFolderParentId}
      />

      <RenameFolderModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        folderId={renameFolderId}
        currentName={renameFolderName}
      />

      <DeleteFolderModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        folderId={deleteFolderId}
        folderName={deleteFolderName}
      />

      {createFileOpen && (
        <CreateFileModal
          open={createFileOpen}
          onClose={() => setCreateFileOpen(false)}
          folderId={createFileInFolder}
          folderName={selectedFolder?.name}
        />
      )}
    </div>
  );
}

function CreateFileModal({
  open,
  onClose,
  folderId,
  folderName,
}: {
  open: boolean;
  onClose: () => void;
  folderId?: string;
  folderName?: string;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [type, setType] = useState<FileType>("md");
  const [name, setName] = useState("new-file");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleClose = useCallback(() => {
    if (pending) return;
    setName("new-file");
    setType("md");
    setError(null);
    onClose();
  }, [pending, onClose]);

  useState(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          folderName,
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
      handleClose();
    } catch {
      setError("Something went wrong.");
      setPending(false);
    }
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
            onClick={handleClose}
            disabled={pending}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-5 text-sm text-slate-400">Choose a file type and name.</p>

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
            onClick={handleClose}
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
