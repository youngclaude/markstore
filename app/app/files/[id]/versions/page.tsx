import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { VersionHistory } from "@/components/version-history";
import {
  getFileForUser,
  getFileVersion,
  getPreviousFileVersion,
  listFileVersions,
} from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function FileVersionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  resolveAuthSecret();
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const { id } = await params;
  const sp = await searchParams;
  const file = await getFileForUser(session.user.id, id);
  if (!file) notFound();

  const versions = await listFileVersions(session.user.id, id);
  const requested = sp.v ? Number.parseInt(sp.v, 10) : NaN;
  const selectedVersion = Number.isFinite(requested)
    ? requested
    : (versions[0]?.version ?? null);

  let selectedContent = "";
  let previousContent = "";
  let previousVersion: number | null = null;

  if (selectedVersion != null) {
    const snap = await getFileVersion(session.user.id, id, selectedVersion);
    selectedContent = snap?.content ?? "";
    const prev = await getPreviousFileVersion(session.user.id, id, selectedVersion);
    previousContent = prev?.content ?? "";
    previousVersion = prev?.version ?? null;
  }

  return (
    <AppShell email={session.user.email ?? "unknown"}>
      <VersionHistory
        fileId={file.id}
        fileName={file.name}
        folderName={file.folder_name}
        versions={versions.map((v) => ({
          id: v.id,
          version: v.version,
          created_at: v.created_at,
          email: v.email ?? null,
        }))}
        initialVersion={selectedVersion}
        selectedContent={selectedContent}
        previousContent={previousContent}
        previousVersion={previousVersion}
      />
    </AppShell>
  );
}
