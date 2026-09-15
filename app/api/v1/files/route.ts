import { authenticateApiKey } from "@/lib/api-keys";
import {
  createFile,
  ensureDefaultFolder,
  findFolderByName,
  normalizeFileName,
  type FileType,
  DEFAULT_FOLDER_NAME,
} from "@/lib/db";
import { listUserFiles } from "@/lib/files-agent";

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

async function requireAgent(request: Request) {
  return authenticateApiKey(request.headers.get("authorization"));
}

function publicFile(f: {
  id: string;
  name: string;
  type: string;
  folder_id: string;
  folder_name?: string;
  size: number;
  updated_at: string;
  created_at: string;
  content?: string;
}) {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    folder_id: f.folder_id,
    folder_name: f.folder_name,
    size: f.size,
    updated_at: f.updated_at,
    created_at: f.created_at,
    ...(f.content !== undefined ? { content: f.content } : {}),
  };
}

export async function GET(request: Request) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const url = new URL(request.url);
    const folderParam = url.searchParams.get("folder");
    let folderId: string | undefined;
    if (folderParam === "all") {
      folderId = undefined;
    } else {
      const folder = folderParam
        ? await findFolderByName(agent.userId, folderParam)
        : await ensureDefaultFolder(agent.userId);
      if (!folder) return jsonError(404, "Folder not found.");
      folderId = folder.id;
    }

    const files = await listUserFiles(agent.userId, folderId);
    return Response.json({
      files: files.map((f) =>
        publicFile({
          id: f.id,
          name: f.name,
          type: f.type,
          folder_id: f.folder_id,
          folder_name: f.folder_name,
          size: f.size,
          updated_at: f.updated_at,
          created_at: f.created_at,
        }),
      ),
    });
  } catch (err) {
    console.error("v1 list files error", err);
    return jsonError(500, "Could not list files.");
  }
}

export async function POST(request: Request) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const body = (await request.json().catch(() => null)) as {
      name?: string;
      type?: string;
      content?: string;
      folderName?: string;
    } | null;
    if (!body) return jsonError(400, "Invalid JSON body.");

    const type = body.type === "json" ? "json" : body.type === "md" ? "md" : null;
    if (!type) return jsonError(400, "type must be md or json.");

    const folder = body.folderName
      ? await findFolderByName(agent.userId, body.folderName)
      : await ensureDefaultFolder(agent.userId);
    if (!folder) return jsonError(404, "Folder not found.");

    const name = normalizeFileName(String(body.name ?? ""), type as FileType);
    if (!name.replace(/\.(md|json)$/i, "").trim()) {
      return jsonError(400, "Enter a filename.");
    }

    if (type === "json" && typeof body.content === "string") {
      try {
        JSON.parse(body.content);
      } catch (e) {
        return jsonError(
          400,
          e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON",
        );
      }
    }

    try {
      const file = await createFile({
        userId: agent.userId,
        folderId: folder.id,
        name,
        type: type as FileType,
        content: body.content,
      });
      return Response.json(
        {
          ok: true,
          file: publicFile({
            id: file.id,
            name: file.name,
            type: file.type,
            folder_id: file.folder_id,
            folder_name: folder.name || DEFAULT_FOLDER_NAME,
            size: file.size,
            updated_at: file.updated_at,
            created_at: file.created_at,
            content: file.content,
          }),
        },
        { status: 201 },
      );
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A file with that name already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 create file error", err);
    return jsonError(500, "Could not create file.");
  }
}
