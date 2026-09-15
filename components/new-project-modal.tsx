"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, ProjectIcon } from "@/components/icons";

export function NewProjectModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      nameInputRef.current?.focus();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleOpen() {
    setName("");
    setDescription("");
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (pending) return;
    setOpen(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        project?: { id: string };
      };

      if (!res.ok || !data.project) {
        setError(data.error ?? "Could not create project.");
        setPending(false);
        return;
      }

      router.push(`/app/projects/${data.project.id}`);
      router.refresh();
      setOpen(false);
    } catch {
      setError("Something went wrong.");
      setPending(false);
    }
  }

  return (
    <>
      <span onClick={handleOpen}>{children}</span>
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
              <ProjectIcon className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">New project</h2>
              <p className="text-sm text-slate-400">
                Create a new project to get started.
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
            Project name
            <input
              ref={nameInputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40"
              placeholder="e.g. Q2 Marketing Campaign"
              required
              disabled={pending}
            />
          </label>

          <label className="mt-4 block text-sm text-slate-300">
            <span className="flex items-center gap-2">
              Description <span className="text-slate-500">(optional)</span>
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 h-24 w-full resize-none rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#1D7BFF] focus:ring-1 focus:ring-[#1D7BFF]/40"
              placeholder="Add a short description of your project..."
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
              disabled={pending || !name.trim()}
              className="rounded-xl bg-[#1D7BFF] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Creating..." : "Create project"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
