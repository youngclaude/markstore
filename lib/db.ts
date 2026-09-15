import { env } from "cloudflare:workers";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  plan_to_store: string | null;
  created_at: string;
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
