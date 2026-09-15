import { env } from "cloudflare:workers";
import {
  DEFAULT_FOLDER_NAME,
  normalizeFileName,
  type FileType,
} from "@/lib/files-shared";
import { getFileVersion, insertFileVersion } from "@/lib/file-versions";

export { DEFAULT_FOLDER_NAME, normalizeFileName, formatBytes, formatModified } from "@/lib/files-shared";
export type { FileType } from "@/lib/files-shared";
export {
  getFileVersion,
  getPreviousFileVersion,
  insertFileVersion,
  listFileVersions,
} from "@/lib/file-versions";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  plan_to_store: string | null;
  created_at: string;
};

export type FolderRow = {
  id: string;
  user_id: string;
  name: string;
  project_id: string | null;
  parent_id: string | null;
  created_at: string;
};

export type FileRow = {
  id: string;
  user_id: string;
  folder_id: string;
  name: string;
  type: FileType;
  content: string;
  size: number;
  updated_at: string;
  created_at: string;
};

export type FileVersionRow = {
  id: string;
  file_id: string;
  user_id: string;
  version: number;
  content: string;
  created_at: string;
};

export type FileVersionMeta = Omit<FileVersionRow, "content"> & {
  email?: string | null;
};

type CloudflareEnv = {
  DB: D1Database;
};

function getEnv(): CloudflareEnv {
  return env as unknown as CloudflareEnv;
}

export function getDb(): D1Database {
  return getEnv().DB;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const row = await getDb()
    .prepare("SELECT id, email, password_hash, plan_to_store, created_at FROM users WHERE email = ?")
    .bind(email.toLowerCase())
    .first<UserRow>();
  return row ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  planToStore?: string | null;
}): Promise<UserRow> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const email = input.email.toLowerCase().trim();
  await getDb()
    .prepare(
      "INSERT INTO users (id, email, password_hash, plan_to_store, created_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(id, email, input.passwordHash, input.planToStore ?? null, createdAt)
    .run();
  return {
    id,
    email,
    password_hash: input.passwordHash,
    plan_to_store: input.planToStore ?? null,
    created_at: createdAt,
  };
}

export async function createFolder(
  userId: string,
  name: string,
  parentId: string | null = null,
): Promise<FolderRow> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await getDb()
    .prepare("INSERT INTO folders (id, user_id, name, project_id, parent_id, created_at) VALUES (?, ?, ?, NULL, ?, ?)")
    .bind(id, userId, name, parentId, createdAt)
    .run();
  return { id, user_id: userId, name, project_id: null, parent_id: parentId, created_at: createdAt };
}

export async function findFolderByName(
  userId: string,
  name: string,
): Promise<FolderRow | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, user_id, name, project_id, parent_id, created_at 
       FROM folders WHERE user_id = ? AND name = ? AND project_id IS NULL`,
    )
    .bind(userId, name)
    .first<FolderRow>();
  return row ?? null;
}

/** Ensure the user has the exact default folder `general files` (ALL-15). */
export async function ensureDefaultFolder(userId: string): Promise<FolderRow> {
  const existing = await findFolderByName(userId, DEFAULT_FOLDER_NAME);
  if (existing) return existing;
  try {
    return await createFolder(userId, DEFAULT_FOLDER_NAME);
  } catch {
    const again = await findFolderByName(userId, DEFAULT_FOLDER_NAME);
    if (again) return again;
    throw new Error("Could not ensure default folder");
  }
}

export async function listFolders(userId: string): Promise<FolderRow[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT id, user_id, name, project_id, parent_id, created_at 
       FROM folders WHERE user_id = ? AND project_id IS NULL
       ORDER BY name COLLATE NOCASE ASC`,
    )
    .bind(userId)
    .all<FolderRow>();
  return results ?? [];
}

export async function listFilesInFolder(
  userId: string,
  folderId: string,
): Promise<FileRow[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT id, user_id, folder_id, name, type, content, size, updated_at, created_at
       FROM files WHERE user_id = ? AND folder_id = ?
       ORDER BY name COLLATE NOCASE ASC`,
    )
    .bind(userId, folderId)
    .all<FileRow>();
  return results ?? [];
}

export async function getFileForUser(
  userId: string,
  fileId: string,
): Promise<(FileRow & { folder_name: string; project_id: string | null; project_name: string | null }) | null> {
  const row = await getDb()
    .prepare(
      `SELECT f.id, f.user_id, f.folder_id, f.name, f.type, f.content, f.size, f.updated_at, f.created_at,
              folders.name AS folder_name, folders.project_id, p.name AS project_name
       FROM files f
       JOIN folders ON folders.id = f.folder_id
       LEFT JOIN projects p ON p.id = folders.project_id
       WHERE f.id = ? AND f.user_id = ?`,
    )
    .bind(fileId, userId)
    .first<FileRow & { folder_name: string; project_id: string | null; project_name: string | null }>();
  return row ?? null;
}

function byteSize(content: string): number {
  return new TextEncoder().encode(content).length;
}

export async function createFile(input: {
  userId: string;
  folderId: string;
  name: string;
  type: FileType;
  content?: string;
}): Promise<FileRow> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const name = normalizeFileName(input.name, input.type);
  const content = input.content ?? (input.type === "json" ? "{\n  \n}\n" : "");
  const size = byteSize(content);
  await getDb()
    .prepare(
      `INSERT INTO files (id, user_id, folder_id, name, type, content, size, updated_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.userId, input.folderId, name, input.type, content, size, now, now)
    .run();
  await insertFileVersion({
    fileId: id,
    userId: input.userId,
    content,
    createdAt: now,
  });
  return {
    id,
    user_id: input.userId,
    folder_id: input.folderId,
    name,
    type: input.type,
    content,
    size,
    updated_at: now,
    created_at: now,
  };
}

export async function updateFileContent(
  userId: string,
  fileId: string,
  content: string,
): Promise<(FileRow & { version: number }) | null> {
  const existing = await getFileForUser(userId, fileId);
  if (!existing) return null;
  const now = new Date().toISOString();
  const size = byteSize(content);
  await getDb()
    .prepare(
      "UPDATE files SET content = ?, size = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    )
    .bind(content, size, now, fileId, userId)
    .run();
  const ver = await insertFileVersion({
    fileId,
    userId,
    content,
    createdAt: now,
  });
  return {
    id: existing.id,
    user_id: existing.user_id,
    folder_id: existing.folder_id,
    name: existing.name,
    type: existing.type,
    content,
    size,
    updated_at: now,
    created_at: existing.created_at,
    version: ver.version,
  };
}

/** Restore a historical snapshot into the live file and create a new version. */
export async function restoreFileVersion(
  userId: string,
  fileId: string,
  version: number,
): Promise<(FileRow & { version: number }) | null> {
  const snap = await getFileVersion(userId, fileId, version);
  if (!snap) return null;
  return updateFileContent(userId, fileId, snap.content);
}

/** Get a single folder by ID (general files, not project-scoped). */
export async function getFolder(
  userId: string,
  folderId: string,
): Promise<FolderRow | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, user_id, name, project_id, parent_id, created_at 
       FROM folders WHERE id = ? AND user_id = ? AND project_id IS NULL`,
    )
    .bind(folderId, userId)
    .first<FolderRow>();
  return row ?? null;
}

/** Rename a folder. */
export async function renameFolder(
  userId: string,
  folderId: string,
  newName: string,
): Promise<FolderRow | null> {
  const existing = await getFolder(userId, folderId);
  if (!existing) return null;
  if (existing.name === DEFAULT_FOLDER_NAME) return null;

  await getDb()
    .prepare(`UPDATE folders SET name = ? WHERE id = ? AND user_id = ?`)
    .bind(newName.trim(), folderId, userId)
    .run();

  return { ...existing, name: newName.trim() };
}

/** Delete a folder and all its contents (general files, not project-scoped). */
export async function deleteFolder(
  userId: string,
  folderId: string,
): Promise<boolean> {
  const folder = await getFolder(userId, folderId);
  if (!folder) return false;
  if (folder.name === DEFAULT_FOLDER_NAME) return false;

  const childFolders = await getDb()
    .prepare(`SELECT id FROM folders WHERE user_id = ? AND parent_id = ? AND project_id IS NULL`)
    .bind(userId, folderId)
    .all<{ id: string }>();

  for (const child of childFolders.results ?? []) {
    await deleteFolder(userId, child.id);
  }

  await getDb()
    .prepare(
      `DELETE FROM file_versions WHERE file_id IN (
         SELECT id FROM files WHERE folder_id = ?
       )`,
    )
    .bind(folderId)
    .run();

  await getDb()
    .prepare(`DELETE FROM files WHERE folder_id = ?`)
    .bind(folderId)
    .run();

  const result = await getDb()
    .prepare(`DELETE FROM folders WHERE id = ? AND user_id = ?`)
    .bind(folderId, userId)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}

/** List all files across all general folders for a user. */
export async function listAllGeneralFiles(userId: string): Promise<(FileRow & { folder_name: string })[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT f.id, f.user_id, f.folder_id, f.name, f.type, f.content, f.size, f.updated_at, f.created_at,
              folders.name AS folder_name
       FROM files f
       JOIN folders ON folders.id = f.folder_id
       WHERE f.user_id = ? AND folders.project_id IS NULL
       ORDER BY f.name COLLATE NOCASE ASC`,
    )
    .bind(userId)
    .all<FileRow & { folder_name: string }>();
  return results ?? [];
}
