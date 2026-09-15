import { getDb } from "@/lib/db";

// Founder email allowlist for admin access
// In production, this could be environment-based or stored in D1
const FOUNDER_EMAILS = [
  "founder@markstore.dev",
  "admin@markstore.dev",
  "jordan@usemarkstore.com",
  // Add founder emails here
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return FOUNDER_EMAILS.some(
    (founder) => founder.toLowerCase() === email.toLowerCase()
  );
}

export async function isAdmin(userId: string): Promise<boolean> {
  const row = await getDb()
    .prepare("SELECT email FROM users WHERE id = ?")
    .bind(userId)
    .first<{ email: string }>();
  if (!row) return false;
  return isAdminEmail(row.email);
}

export async function requireAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  return isAdmin(userId);
}
