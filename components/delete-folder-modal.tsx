"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, TrashIcon } from "@/components/icons";

interface DeleteFolderModalProps {
  open: boolean;
  onClose: () => void;
  folderId: string;
  folderName: string;
}

export function DeleteFolderModal({
  open,
  onClose,
  folderId,
  folderName,
}: DeleteFolderModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      setError(null);
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleClose() {
    if (pending) return;
    setError(null);
    onClose();
  }

  async function handleDelete() {
    setError(null);
    setPending(true);

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not delete folder.");
        setPending(false);
        return;
      }

      router.push("/app");
      router.refresh();
      handleClose();
    } catch {
      setError("Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose();
      }}
      className="m-auto w-full max-w-lg rounded-2xl border border-slate-700/70 bg-[#0F131A] p-0 text-slate-50 shadow-2xl shadow-black/60 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
            <TrashIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Delete folder</h2>
            <p className="text-sm text-slate-400">This action cannot be undone.</p>
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

        <p className="text-sm text-slate-300">
          Are you sure you want to delete <strong className="text-slate-100">{folderName}</strong>?
          All files and subfolders within it will be permanently deleted.
        </p>

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
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Deleting..." : "Delete folder"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
