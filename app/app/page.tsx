import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { FilesClient } from "@/components/files-client";
import { FolderIcon } from "@/components/icons";
import {
  DEFAULT_FOLDER_NAME,
  ensureDefaultFolder,
  listFolders,
  listAllGeneralFiles,
  getFolder,
} from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function AppPage({
  searchParams,
}: {
  searchParams?: Promise<{ folder?: string }>;
}) {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will handle missing secret */
  }
  const session = await auth();
  const email = session?.user?.email ?? "unknown";
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const sp = searchParams ? await searchParams : {};
  const requestedFolderId = sp.folder;

  const defaultFolder = await ensureDefaultFolder(userId);
  const folders = await listFolders(userId);
  const files = await listAllGeneralFiles(userId);

  let selectedFolder = requestedFolderId
    ? await getFolder(userId, requestedFolderId)
    : defaultFolder;

  if (!selectedFolder) {
    selectedFolder = defaultFolder;
  }

  const folderData = folders.map((f) => ({
    id: f.id,
    name: f.name,
    parent_id: f.parent_id,
  }));

  const fileData = files.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.type,
    folder_id: f.folder_id,
    size: f.size,
    updated_at: f.updated_at,
  }));

  const selectedFolderData = selectedFolder
    ? { id: selectedFolder.id, name: selectedFolder.name, parent_id: selectedFolder.parent_id }
    : null;

  return (
    <AppShell email={email} activeFolder={DEFAULT_FOLDER_NAME}>
      <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
            <FolderIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">General Files</h1>
            <p className="text-sm text-slate-500">Personal files for this workspace.</p>
          </div>
        </div>
      </header>

      <FilesClient
        folders={folderData}
        files={fileData}
        selectedFolder={selectedFolderData}
      />
    </AppShell>
  );
}
