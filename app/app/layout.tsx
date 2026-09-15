import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { ensureDefaultFolder } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will redirect / fail closed */
  }
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }
  // ALL-15: backfill default folder for existing users on first /app visit
  await ensureDefaultFolder(session.user.id);
  return <>{children}</>;
}
