import { authenticateApiKey } from "@/lib/api-keys";
import {
  createFolder,
  listFolders,
  DEFAULT_FOLDER_NAME,
} from "@/lib/db";

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

async function requireAgent(request: Request) {
  return authenticateApiKey(request.headers.get("authorization"));
}

export async function GET(request: Request) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const folders = await listFolders(agent.userId);
    return Response.json({
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        created_at: f.created_at,
      })),
    });
  } catch (err) {
    console.error("v1 list folders error", err);
    return jsonError(500, "Could not list folders.");
  }
}

export async function POST(request: Request) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const body = (await request.json().catch(() => null)) as {
      name?: string;
    } | null;
    if (!body) return jsonError(400, "Invalid JSON body.");

    const name = body.name?.trim();
    if (!name) {
      return jsonError(400, "Folder name is required.");
    }

    if (name.toLowerCase() === DEFAULT_FOLDER_NAME.toLowerCase()) {
      return jsonError(400, "Cannot create a folder with that name.");
    }

    try {
      const folder = await createFolder(agent.userId, name);
      return Response.json(
        {
          ok: true,
          folder: {
            id: folder.id,
            name: folder.name,
            created_at: folder.created_at,
          },
        },
        { status: 201 },
      );
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A folder with that name already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 create folder error", err);
    return jsonError(500, "Could not create folder.");
  }
}
