import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will redirect / fail closed */
  }
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  return <>{children}</>;
}
