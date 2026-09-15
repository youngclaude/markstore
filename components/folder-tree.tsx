"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocIcon,
  FolderIcon,
  FolderPlusIcon,
  JsonIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MoreIcon,
} from "@/components/icons";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";
import type { FolderRow, FileRow } from "@/lib/db";

type FolderData = Pick<FolderRow, "id" | "name" | "parent_id">;
type FileData = Pick<FileRow, "id" | "name" | "type" | "folder_id">;

interface FolderTreeProps {
  folders: FolderData[];
  files: FileData[];
  activeFolderId?: string;
  activeFileId?: string;
  onCreateFolder: (parentId: string | null) => void;
  onRenameFolder: (folderId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onCreateFile: (folderId: string) => void;
}

interface ContextMenuState {
  folderId: string;
  folderName: string;
  x: number;
  y: number;
}

export function FolderTree({
  folders,
  files,
  activeFolderId,
  activeFileId,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onCreateFile,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const set = new Set<string>();
    folders.forEach((f) => set.add(f.id));
    return set;
  });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }
    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [contextMenu]);

  function toggleFolder(folderId: string, e: React.MouseEvent) {
    e.stopPropagation();
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

  function handleContextMenu(e: React.MouseEvent, folder: FolderData) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      folderId: folder.id,
      folderName: folder.name,
      x: e.clientX,
      y: e.clientY,
    });
  }

  function buildTree(parentId: string | null): FolderData[] {
    return folders.filter((f) => f.parent_id === parentId);
  }

  function getFilesInFolder(folderId: string): FileData[] {
    return files.filter((f) => f.folder_id === folderId);
  }

  function renderFolder(folder: FolderData, depth: number = 0) {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = activeFolderId === folder.id;
    const folderFiles = getFilesInFolder(folder.id);
    const childFolders = buildTree(folder.id);
    const hasChildren = childFolders.length > 0 || folderFiles.length > 0;
    const isDefaultFolder = folder.name === DEFAULT_FOLDER_NAME;

    return (
      <li key={folder.id}>
        <div
          className={`group flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-sm ${
            isSelected
              ? "bg-[#1D7BFF]/15 text-cyan-200"
              : "text-slate-300 hover:bg-slate-800"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onContextMenu={(e) => handleContextMenu(e, folder)}
        >
          <button
            type="button"
            onClick={(e) => toggleFolder(folder.id, e)}
            className="rounded p-0.5 hover:bg-slate-700"
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="h-3.5 w-3.5" />
              ) : (
                <ChevronRightIcon className="h-3.5 w-3.5" />
              )
            ) : (
              <span className="inline-block h-3.5 w-3.5" />
            )}
          </button>
          <Link
            href={`/app?folder=${folder.id}`}
            className="flex flex-1 items-center gap-1.5 truncate"
          >
            <FolderIcon className="h-4 w-4 shrink-0 text-[#4F9DFF]" />
            <span className="truncate">{folder.name}</span>
          </Link>
          {!isDefaultFolder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleContextMenu(e, folder);
              }}
              className="rounded p-0.5 opacity-0 hover:bg-slate-700 group-hover:opacity-100"
              aria-label="Folder options"
            >
              <MoreIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isExpanded && (
          <ul className="space-y-0.5">
            {childFolders.map((child) => renderFolder(child, depth + 1))}
            {folderFiles.map((file) => (
              <li key={file.id}>
                <Link
                  href={`/app/files/${file.id}`}
                  className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm ${
                    activeFileId === file.id
                      ? "bg-[#1D7BFF]/15 text-cyan-200"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
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
  }

  const rootFolders = buildTree(null);

  return (
    <>
      <ul className="space-y-0.5">
        {rootFolders.map((folder) => renderFolder(folder))}
      </ul>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[160px] rounded-lg border border-slate-700 bg-[#0F131A] py-1 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            type="button"
            onClick={() => {
              onCreateFile(contextMenu.folderId);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            <PlusIcon className="h-4 w-4 text-slate-400" />
            New file
          </button>
          <button
            type="button"
            onClick={() => {
              onCreateFolder(contextMenu.folderId);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            <FolderPlusIcon className="h-4 w-4 text-slate-400" />
            New folder
          </button>
          <div className="my-1 border-t border-slate-700" />
          <button
            type="button"
            onClick={() => {
              onRenameFolder(contextMenu.folderId, contextMenu.folderName);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            <PencilIcon className="h-4 w-4 text-slate-400" />
            Rename
          </button>
          <button
            type="button"
            onClick={() => {
              onDeleteFolder(contextMenu.folderId, contextMenu.folderName);
              setContextMenu(null);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-slate-800"
          >
            <TrashIcon className="h-4 w-4 text-red-400" />
            Delete
          </button>
        </div>
      )}
    </>
  );
}
