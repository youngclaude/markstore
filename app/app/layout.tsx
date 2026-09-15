import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { ensureDefaultFolder } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    resolveAuthSecret();
  } catch {
    /* process.env may already have AUTH_SECRET from nodejs_compat_populate_process_env */
  }

  const session = await auth();

  // Middleware handles redirect for unauthenticated users
  // This is a fallback check - if somehow we get here without a session, render nothing
  if (!session?.user?.id) {
    return null;
  }

  // ALL-15: backfill default folder for existing users on first /app visit
  await ensureDefaultFolder(session.user.id);
  return <>{children}</>;
}
