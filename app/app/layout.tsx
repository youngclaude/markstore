import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Temporary minimal layout to test if issue is with auth imports
  try {
    // Dynamically import auth to isolate errors
    const { auth } = await import("@/auth");
    const { resolveAuthSecret } = await import("@/lib/auth-secret");
    const { ensureDefaultFolder } = await import("@/lib/db");

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
    console.error("[AppLayout] Error:", error);
    redirect("/signin");
  }
}
