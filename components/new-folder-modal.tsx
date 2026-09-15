"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, FolderIcon, FolderPlusIcon } from "@/components/icons";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";
import type { FolderRow } from "@/lib/db";

type FolderData = Pick<FolderRow, "id" | "name" | "parent_id">;

interface NewFolderModalProps {
  open: boolean;
  onClose: () => void;
  folders: FolderData[];
  defaultParentId?: string | null;
}

export function NewFolderModal({
  open,
  onClose,
  folders,
  defaultParentId = null,
}: NewFolderModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      nameInputRef.current?.focus();
      setParentId(defaultParentId);
    } else {
      dialogRef.current?.close();
    }
  }, [open, defaultParentId]);

  function handleClose() {
    if (pending) return;
    setName("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          parentId: parentId || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        folder?: { id: string };
      };

      if (!res.ok || !data.folder) {
        setError(data.error ?? "Could not create folder.");
        setPending(false);
        return;
      }

      router.push(`/app?folder=${data.folder.id}`);
      router.refresh();
      handleClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const rootFolders = folders.filter(
    (f) => f.parent_id === null && f.name !== DEFAULT_FOLDER_NAME,
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      className="m-auto w-full max-w-lg rounded-2xl border border-slate-700/70 bg-[#0F131A] p-0 text-slate-50 shadow-2xl shadow-black/60 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
            <FolderPlusIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">New folder</h2>
            <p className="text-sm text-slate-400">
              Create a new folder to organize your files.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-5 block text-sm text-slate-300">
          Folder name
          <input
            ref={nameInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40"
            placeholder="e.g. Marketing Assets"
            required
            disabled={pending}
          />
        </label>

        <label className="mt-4 block text-sm text-slate-300">
          <span className="flex items-center gap-2">
            Parent folder <span className="text-slate-500">(optional)</span>
          </span>
          <div className="relative mt-1.5">
            <FolderIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#4F9DFF]" />
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              disabled={pending}
              className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-950/80 py-3 pl-9 pr-3 text-sm text-slate-100 outline-none focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40 disabled:opacity-50"
            >
              <option value="">Project Root</option>
              {rootFolders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Choose a parent folder, or leave as Project Root to create in the top level.
          </p>
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
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="rounded-xl bg-[#1D7BFF] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Creating..." : "Create folder"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
