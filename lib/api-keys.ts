import { getDb } from "@/lib/db";

export type ApiKeyRow = {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export type ApiKeyPublic = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

const KEY_PREFIX = "msk_";
const SECRET_BYTES = 24; // 32 chars base64url-ish

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SECRET_BYTES));
  // base64url without padding
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashApiKey(plaintext: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(plaintext));
  return toHex(digest);
}

export function displayPrefix(plaintext: string): string {
  // e.g. msk_AbCdEfGh…
  return plaintext.slice(0, KEY_PREFIX.length + 8);
}

export async function createApiKey(input: {
  userId: string;
  name: string;
}): Promise<{ key: ApiKeyPublic; plaintext: string }> {
  const name = input.name.trim() || "Agent key";
  const plaintext = `${KEY_PREFIX}${randomSecret()}`;
  const keyHash = await hashApiKey(plaintext);
  const keyPrefix = displayPrefix(plaintext);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await getDb()
    .prepare(
      `INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at, last_used_at, revoked_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)`,
    )
    .bind(id, input.userId, name, keyHash, keyPrefix, createdAt)
    .run();

  return {
    plaintext,
    key: {
      id,
      name,
      key_prefix: keyPrefix,
      created_at: createdAt,
      last_used_at: null,
      revoked_at: null,
    },
  };
}

export async function listApiKeys(userId: string): Promise<ApiKeyPublic[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT id, name, key_prefix, created_at, last_used_at, revoked_at
       FROM api_keys
       WHERE user_id = ?
       ORDER BY created_at DESC`,
    )
    .bind(userId)
    .all<ApiKeyPublic>();
  return results ?? [];
}

export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
  const now = new Date().toISOString();
  const result = await getDb()
    .prepare(
      `UPDATE api_keys SET revoked_at = ?
       WHERE id = ? AND user_id = ? AND revoked_at IS NULL`,
    )
    .bind(now, keyId, userId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

/** Authenticate Bearer token → user_id. Updates last_used_at on success. */
export async function authenticateApiKey(
  authorizationHeader: string | null,
): Promise<{ userId: string; keyId: string } | null> {
  if (!authorizationHeader) return null;
  const m = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim());
  if (!m) return null;
  const token = m[1]!;
  if (!token.startsWith(KEY_PREFIX)) return null;

  const keyHash = await hashApiKey(token);
  const row = await getDb()
    .prepare(
      `SELECT id, user_id, revoked_at FROM api_keys WHERE key_hash = ?`,
    )
    .bind(keyHash)
    .first<{ id: string; user_id: string; revoked_at: string | null }>();

  if (!row || row.revoked_at) return null;

  const now = new Date().toISOString();
  // fire-and-forget style; await to keep D1 happy in Workers
  await getDb()
    .prepare(`UPDATE api_keys SET last_used_at = ? WHERE id = ?`)
    .bind(now, row.id)
    .run();

  return { userId: row.user_id, keyId: row.id };
}
