"use client";

import { FolderIcon, PlusIcon, UploadCloudIcon } from "@/components/icons";

interface EmptyFolderStateProps {
  folderName: string;
  onCreateFile: () => void;
  onUpload: () => void;
}

export function EmptyFolderState({
  folderName,
  onCreateFile,
  onUpload,
}: EmptyFolderStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-500">
        <FolderIcon className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-100">This folder is empty.</h2>
      <p className="mb-8 mt-2 max-w-md text-slate-400">
        Add your first file or upload existing content to get started.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCreateFile}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1D7BFF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
        >
          <PlusIcon className="h-4 w-4" />
          Create file
        </button>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-slate-500"
        >
          <UploadCloudIcon className="h-4 w-4" />
          Upload .md/.json
        </button>
      </div>
    </div>
  );
}
