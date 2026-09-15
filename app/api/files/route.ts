import { auth } from "@/auth";
import {
  createFile,
  ensureDefaultFolder,
  findFolderByName,
  normalizeFileName,
  type FileType,
} from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      type?: string;
      folderName?: string;
      content?: string;
    };

    const type = body.type === "json" ? "json" : body.type === "md" ? "md" : null;
    if (!type) {
      return Response.json({ error: "Type must be md or json." }, { status: 400 });
    }

    const folder = body.folderName
      ? await findFolderByName(session.user.id, body.folderName)
      : await ensureDefaultFolder(session.user.id);
    if (!folder) {
      return Response.json({ error: "Folder not found." }, { status: 404 });
    }

    const name = normalizeFileName(String(body.name ?? ""), type as FileType);
    if (!name.replace(/\.(md|json)$/i, "").trim()) {
      return Response.json({ error: "Enter a filename." }, { status: 400 });
    }

    try {
      const file = await createFile({
        userId: session.user.id,
        folderId: folder.id,
        name,
        type: type as FileType,
        content: body.content,
      });
      return Response.json({
        ok: true,
        file: {
          id: file.id,
          name: file.name,
          type: file.type,
          folder_id: file.folder_id,
        },
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return Response.json({ error: "A file with that name already exists." }, { status: 409 });
      }
      throw err;
    }
  } catch (err) {
    console.error("create file error", err);
    return Response.json({ error: "Could not create file." }, { status: 500 });
  }
}
