"use client";

import Link from "next/link";
import { ProjectIcon, FolderIcon, DocIcon } from "@/components/icons";
import { formatModified } from "@/lib/files-shared";

export function ProjectCard({
  id,
  name,
  description,
  fileCount,
  folderCount,
  updatedAt,
}: {
  id: string;
  name: string;
  description: string | null;
  fileCount: number;
  folderCount: number;
  updatedAt: string;
}) {
  return (
    <Link
      href={`/app/projects/${id}`}
      className="group flex flex-col rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 transition hover:border-slate-700 hover:bg-slate-900/60"
    >
      <div className="mb-3 flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF] group-hover:bg-[#1D7BFF]/25">
          <ProjectIcon className="h-5 w-5" />
        </span>
      </div>
      <h3 className="truncate text-base font-semibold text-slate-100">{name}</h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-400">{description}</p>
      )}
      <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <FolderIcon className="h-3.5 w-3.5" />
          {folderCount} folder{folderCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <DocIcon className="h-3.5 w-3.5" />
          {fileCount} file{fileCount !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Updated {formatModified(updatedAt)}</p>
    </Link>
  );
}
