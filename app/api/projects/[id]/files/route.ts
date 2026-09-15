import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { createFile, normalizeFileName, type FileType } from "@/lib/db";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";
import {
  findProjectFolderByName,
  getProject,
  listProjectFiles,
  listProjectFolders,
} from "@/lib/projects";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProject(session.user.id, id);
    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    const url = new URL(request.url);
    const folderId = url.searchParams.get("folderId") ?? undefined;

    const files = await listProjectFiles(session.user.id, id, folderId);
    return Response.json({
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        folder_id: f.folder_id,
        folder_name: f.folder_name,
        size: f.size,
        updated_at: f.updated_at,
        created_at: f.created_at,
      })),
    });
  } catch (err) {
    console.error("list project files error", err);
    return Response.json({ error: "Could not list files." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await getProject(session.user.id, id);
    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      name?: string;
      type?: string;
      folderId?: string;
      folderName?: string;
      content?: string;
    };

    const type = body.type === "json" ? "json" : body.type === "md" ? "md" : null;
    if (!type) {
      return Response.json({ error: "Type must be md or json." }, { status: 400 });
    }

    let folderId = body.folderId;
    if (!folderId) {
      const folderName = body.folderName ?? DEFAULT_FOLDER_NAME;
      const folder = await findProjectFolderByName(session.user.id, id, folderName);
      if (!folder) {
        const folders = await listProjectFolders(session.user.id, id);
        const defaultFolder = folders.find((f) => f.name === DEFAULT_FOLDER_NAME);
        if (!defaultFolder) {
          return Response.json({ error: "Folder not found." }, { status: 404 });
        }
        folderId = defaultFolder.id;
      } else {
        folderId = folder.id;
      }
    }

    const name = normalizeFileName(String(body.name ?? ""), type as FileType);
    if (!name.replace(/\.(md|json)$/i, "").trim()) {
      return Response.json({ error: "Enter a filename." }, { status: 400 });
    }

    try {
      const file = await createFile({
        userId: session.user.id,
        folderId,
        name,
        type: type as FileType,
        content: body.content,
      });
      return Response.json(
        {
          ok: true,
          file: {
            id: file.id,
            name: file.name,
            type: file.type,
            folder_id: file.folder_id,
          },
        },
        { status: 201 },
      );
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return Response.json(
          { error: "A file with that name already exists in this folder." },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("create project file error", err);
    return Response.json({ error: "Could not create file." }, { status: 500 });
  }
}
