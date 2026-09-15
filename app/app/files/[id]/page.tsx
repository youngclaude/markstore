import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { FileEditor } from "@/components/file-editor";
import { getFileForUser } from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { isAdminEmail } from "@/lib/admin";

export default async function FileEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    resolveAuthSecret();
  } catch {
    /* process.env may already have AUTH_SECRET */
  }
  const session = await auth();
  // Middleware handles redirect; fallback check
  if (!session?.user?.id) return null;
  const { id } = await params;
  const file = await getFileForUser(session.user.id, id);
  if (!file) notFound();

  const activeFolder = file.project_id ? "__projects__" : file.folder_name;
  const isAdmin = isAdminEmail(session.user.email);

  return (
    <AppShell email={session.user.email ?? "unknown"} activeFolder={activeFolder} isAdmin={isAdmin}>
      <FileEditor
        fileId={file.id}
        name={file.name}
        type={file.type}
        folderName={file.folder_name}
        projectId={file.project_id}
        projectName={file.project_name}
        initialContent={file.content}
      />
    </AppShell>
  );
}
