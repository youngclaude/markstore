"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, PencilIcon } from "@/components/icons";

interface RenameFolderModalProps {
  open: boolean;
  onClose: () => void;
  folderId: string;
  currentName: string;
}

export function RenameFolderModal({
  open,
  onClose,
  folderId,
  currentName,
}: RenameFolderModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
      setName(currentName);
      setError(null);
    } else {
      dialogRef.current?.close();
    }
  }, [open, currentName]);

  function handleClose() {
    if (pending) return;
    setName(currentName);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch(`/api/folders/${folderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not rename folder.");
        setPending(false);
        return;
      }

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
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-1 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
            <PencilIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Rename folder</h2>
            <p className="text-sm text-slate-400">Enter a new name for this folder.</p>
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
            placeholder="Folder name"
            required
            disabled={pending}
          />
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
            disabled={pending || !name.trim() || name.trim() === currentName}
            className="rounded-xl bg-[#1D7BFF] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Renaming..." : "Rename"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
