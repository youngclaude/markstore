import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { ensureDefaultFolder } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    // Attempt to resolve auth secret from Workers env
    try {
      resolveAuthSecret();
    } catch {
      // Secret may already be in process.env from nodejs_compat_populate_process_env
    }

    const session = await auth();
    if (!session?.user?.id) {
      redirect("/signin");
    }

    // ALL-15: backfill default folder for existing users on first /app visit
    await ensureDefaultFolder(session.user.id);
    return <>{children}</>;
  } catch (error) {
    // Any error in auth flow should redirect to signin rather than crash
    console.error("[AppLayout] Auth error, redirecting to signin:", error);
    redirect("/signin");
  }
}
