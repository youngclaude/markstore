import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { CreateFileForm } from "@/components/create-file-form";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";
import type { FileType } from "@/lib/files-shared";

export default async function NewFilePage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will handle missing secret */
  }
  const session = await auth();
  const email = session?.user?.email ?? "unknown";
  const isAdmin = isAdminEmail(email);
  const sp = searchParams ? await searchParams : {};
  const defaultType: FileType = sp.type === "json" ? "json" : "md";

  return (
    <AppShell email={email} isAdmin={isAdmin}>
      <div className="relative flex flex-1 items-start justify-center px-4 py-10 sm:items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        />
        <div className="relative z-10 w-full max-w-lg">
          <CreateFileForm defaultType={defaultType} />
        </div>
      </div>
    </AppShell>
  );
}
