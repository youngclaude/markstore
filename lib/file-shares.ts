import { getDb } from "@/lib/db";
import type { FileType } from "@/lib/files-shared";

export const PUBLIC_SHARE_ORIGIN = "https://usemarkstore.com";

export type FileShareRow = {
  id: string;
  file_id: string;
  user_id: string;
  slug: string;
  created_at: string;
  revoked_at: string | null;
};

export type ShareStatus = {
  enabled: boolean;
  slug: string | null;
  url: string | null;
  created_at: string | null;
};

export type PublicSharedFile = {
  slug: string;
  name: string;
  type: FileType;
  content: string;
  size: number;
  updated_at: string;
};

function shareUrl(slug: string): string {
  return `${PUBLIC_SHARE_ORIGIN}/s/${slug}`;
}

/** URL-safe random slug (~10 chars). */
function randomSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 10);
}

export async function getActiveShareForFile(
  userId: string,
  fileId: string,
): Promise<FileShareRow | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, file_id, user_id, slug, created_at, revoked_at
       FROM file_shares
       WHERE file_id = ? AND user_id = ? AND revoked_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(fileId, userId)
    .first<FileShareRow>();
  return row ?? null;
}

export async function getShareStatus(
  userId: string,
  fileId: string,
): Promise<ShareStatus> {
  const row = await getActiveShareForFile(userId, fileId);
  if (!row) {
    return { enabled: false, slug: null, url: null, created_at: null };
  }
  return {
    enabled: true,
    slug: row.slug,
    url: shareUrl(row.slug),
    created_at: row.created_at,
  };
}

/** Enable public link: reuse active share, or un-revoke latest, or insert new. */
export async function enableFileShare(
  userId: string,
  fileId: string,
): Promise<ShareStatus> {
  const active = await getActiveShareForFile(userId, fileId);
  if (active) {
    return {
      enabled: true,
      slug: active.slug,
      url: shareUrl(active.slug),
      created_at: active.created_at,
    };
  }

  // Prefer reactivating the most recent revoked row with a fresh slug
  const previous = await getDb()
    .prepare(
      `SELECT id, file_id, user_id, slug, created_at, revoked_at
       FROM file_shares
       WHERE file_id = ? AND user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(fileId, userId)
    .first<FileShareRow>();

  const now = new Date().toISOString();
  let slug = randomSlug();

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      if (previous) {
        await getDb()
          .prepare(
            `UPDATE file_shares
             SET slug = ?, revoked_at = NULL, created_at = ?
             WHERE id = ? AND user_id = ?`,
          )
          .bind(slug, now, previous.id, userId)
          .run();
        return { enabled: true, slug, url: shareUrl(slug), created_at: now };
      }

      const id = crypto.randomUUID();
      await getDb()
        .prepare(
          `INSERT INTO file_shares (id, file_id, user_id, slug, created_at, revoked_at)
           VALUES (?, ?, ?, ?, ?, NULL)`,
        )
        .bind(id, fileId, userId, slug, now)
        .run();
      return { enabled: true, slug, url: shareUrl(slug), created_at: now };
    } catch {
      slug = randomSlug();
    }
  }
  throw new Error("Could not allocate share slug");
}

export async function revokeFileShare(
  userId: string,
  fileId: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  const result = await getDb()
    .prepare(
      `UPDATE file_shares SET revoked_at = ?
       WHERE file_id = ? AND user_id = ? AND revoked_at IS NULL`,
    )
    .bind(now, fileId, userId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

/** Resolve public slug → file content if share is active. */
export async function getPublicSharedFile(
  slug: string,
): Promise<PublicSharedFile | null> {
  const cleaned = slug.trim();
  if (!cleaned || cleaned.length > 64) return null;

  const row = await getDb()
    .prepare(
      `SELECT s.slug AS slug,
              f.name AS name,
              f.type AS type,
              f.content AS content,
              f.size AS size,
              f.updated_at AS updated_at
       FROM file_shares s
       JOIN files f ON f.id = s.file_id
       WHERE s.slug = ? AND s.revoked_at IS NULL`,
    )
    .bind(cleaned)
    .first<PublicSharedFile>();
  return row ?? null;
}
