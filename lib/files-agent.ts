import {
  getDb,
  getFileForUser,
  insertFileVersion,
  normalizeFileName,
  type FileRow,
} from "@/lib/db";

function byteSize(content: string): number {
  return new TextEncoder().encode(content).length;
}

export async function listUserFiles(
  userId: string,
  folderId?: string,
): Promise<(FileRow & { folder_name: string })[]> {
  if (folderId) {
    const { results } = await getDb()
      .prepare(
        `SELECT f.id, f.user_id, f.folder_id, f.name, f.type, f.content, f.size, f.updated_at, f.created_at,
                folders.name AS folder_name
         FROM files f
         JOIN folders ON folders.id = f.folder_id
         WHERE f.user_id = ? AND f.folder_id = ?
         ORDER BY f.name COLLATE NOCASE ASC`,
      )
      .bind(userId, folderId)
      .all<FileRow & { folder_name: string }>();
    return results ?? [];
  }
  const { results } = await getDb()
    .prepare(
      `SELECT f.id, f.user_id, f.folder_id, f.name, f.type, f.content, f.size, f.updated_at, f.created_at,
              folders.name AS folder_name
       FROM files f
       JOIN folders ON folders.id = f.folder_id
       WHERE f.user_id = ?
       ORDER BY folders.name COLLATE NOCASE ASC, f.name COLLATE NOCASE ASC`,
    )
    .bind(userId)
    .all<FileRow & { folder_name: string }>();
  return results ?? [];
}

export async function updateFileMeta(
  userId: string,
  fileId: string,
  patch: { content?: string; name?: string },
): Promise<(FileRow & { version?: number }) | null> {
  const existing = await getFileForUser(userId, fileId);
  if (!existing) return null;

  const now = new Date().toISOString();
  let content = existing.content;
  let name = existing.name;
  let size = existing.size;
  let version: number | undefined;

  if (typeof patch.name === "string" && patch.name.trim()) {
    name = normalizeFileName(patch.name.trim(), existing.type);
  }

  if (typeof patch.content === "string") {
    content = patch.content;
    size = byteSize(content);
    await getDb()
      .prepare(
        "UPDATE files SET content = ?, size = ?, name = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      )
      .bind(content, size, name, now, fileId, userId)
      .run();
    const ver = await insertFileVersion({
      fileId,
      userId,
      content,
      createdAt: now,
    });
    version = ver.version;
  } else if (name !== existing.name) {
    await getDb()
      .prepare("UPDATE files SET name = ?, updated_at = ? WHERE id = ? AND user_id = ?")
      .bind(name, now, fileId, userId)
      .run();
  } else {
    return existing;
  }

  return {
    id: existing.id,
    user_id: existing.user_id,
    folder_id: existing.folder_id,
    name,
    type: existing.type,
    content,
    size,
    updated_at: now,
    created_at: existing.created_at,
    ...(version !== undefined ? { version } : {}),
  };
}

/** Hard-delete file and cascade versions. */
export async function deleteFile(userId: string, fileId: string): Promise<boolean> {
  const existing = await getFileForUser(userId, fileId);
  if (!existing) return false;
  await getDb()
    .prepare("DELETE FROM file_versions WHERE file_id = ?")
    .bind(fileId)
    .run();
  const result = await getDb()
    .prepare("DELETE FROM files WHERE id = ? AND user_id = ?")
    .bind(fileId, userId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}
