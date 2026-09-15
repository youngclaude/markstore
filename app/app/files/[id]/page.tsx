import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { FileEditor } from "@/components/file-editor";
import { getFileForUser } from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function FileEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    resolveAuthSecret();
  } catch {
    /* auth() will handle missing secret */
  }
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const { id } = await params;
  const file = await getFileForUser(session.user.id, id);
  if (!file) notFound();

  const activeFolder = file.project_id ? "__projects__" : file.folder_name;

  return (
    <AppShell email={session.user.email ?? "unknown"} activeFolder={activeFolder}>
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
