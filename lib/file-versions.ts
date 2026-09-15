import { env } from "cloudflare:workers";
import type { FileVersionMeta, FileVersionRow } from "@/lib/db";

type CloudflareEnv = { DB: D1Database };

function getDb(): D1Database {
  return (env as unknown as CloudflareEnv).DB;
}

async function nextVersionNumber(fileId: string): Promise<number> {
  const row = await getDb()
    .prepare("SELECT COALESCE(MAX(version), 0) AS max_v FROM file_versions WHERE file_id = ?")
    .bind(fileId)
    .first<{ max_v: number }>();
  return (row?.max_v ?? 0) + 1;
}

export async function insertFileVersion(input: {
  fileId: string;
  userId: string;
  content: string;
  createdAt?: string;
}): Promise<FileVersionRow> {
  const id = crypto.randomUUID();
  const createdAt = input.createdAt ?? new Date().toISOString();
  const version = await nextVersionNumber(input.fileId);
  await getDb()
    .prepare(
      `INSERT INTO file_versions (id, file_id, user_id, version, content, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.fileId, input.userId, version, input.content, createdAt)
    .run();
  return {
    id,
    file_id: input.fileId,
    user_id: input.userId,
    version,
    content: input.content,
    created_at: createdAt,
  };
}

export async function listFileVersions(
  userId: string,
  fileId: string,
): Promise<FileVersionMeta[]> {
  // ownership check
  const owned = await getDb()
    .prepare("SELECT id FROM files WHERE id = ? AND user_id = ?")
    .bind(fileId, userId)
    .first<{ id: string }>();
  if (!owned) return [];
  const { results } = await getDb()
    .prepare(
      `SELECT fv.id, fv.file_id, fv.user_id, fv.version, fv.created_at, u.email AS email
       FROM file_versions fv
       LEFT JOIN users u ON u.id = fv.user_id
       WHERE fv.file_id = ?
       ORDER BY fv.version DESC`,
    )
    .bind(fileId)
    .all<FileVersionMeta>();
  return results ?? [];
}

export async function getFileVersion(
  userId: string,
  fileId: string,
  version: number,
): Promise<FileVersionRow | null> {
  const owned = await getDb()
    .prepare("SELECT id FROM files WHERE id = ? AND user_id = ?")
    .bind(fileId, userId)
    .first<{ id: string }>();
  if (!owned) return null;
  const row = await getDb()
    .prepare(
      `SELECT id, file_id, user_id, version, content, created_at
       FROM file_versions WHERE file_id = ? AND version = ?`,
    )
    .bind(fileId, version)
    .first<FileVersionRow>();
  return row ?? null;
}

export async function getPreviousFileVersion(
  userId: string,
  fileId: string,
  version: number,
): Promise<FileVersionRow | null> {
  const owned = await getDb()
    .prepare("SELECT id FROM files WHERE id = ? AND user_id = ?")
    .bind(fileId, userId)
    .first<{ id: string }>();
  if (!owned) return null;
  const row = await getDb()
    .prepare(
      `SELECT id, file_id, user_id, version, content, created_at
       FROM file_versions WHERE file_id = ? AND version < ?
       ORDER BY version DESC LIMIT 1`,
    )
    .bind(fileId, version)
    .first<FileVersionRow>();
  return row ?? null;
}
