import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { ensureDefaultFolder } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Resolve auth secret first
  try {
    resolveAuthSecret();
  } catch {
    // Will use process.env fallback
  }

  // Get session - auth() now returns null on error instead of throwing
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/signin");
  }

  // Backfill default folder for existing users
  await ensureDefaultFolder(session.user.id);
  
  return <>{children}</>;
}
