import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { deleteProjectFolder, getProject, getProjectFolder } from "@/lib/projects";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; folderId: string }> },
) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, folderId } = await params;
    const project = await getProject(session.user.id, id);
    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    const folder = await getProjectFolder(session.user.id, folderId);
    if (!folder || folder.project_id !== id) {
      return Response.json({ error: "Folder not found." }, { status: 404 });
    }

    if (folder.name === DEFAULT_FOLDER_NAME) {
      return Response.json(
        { error: "Cannot delete the default folder." },
        { status: 400 },
      );
    }

    const deleted = await deleteProjectFolder(session.user.id, folderId);
    if (!deleted) {
      return Response.json({ error: "Could not delete folder." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete project folder error", err);
    return Response.json({ error: "Could not delete folder." }, { status: 500 });
  }
}
