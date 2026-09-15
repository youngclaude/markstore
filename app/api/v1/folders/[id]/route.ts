import { authenticateApiKey } from "@/lib/api-keys";
import {
  deleteFolder,
  getFolder,
  renameFolder,
  DEFAULT_FOLDER_NAME,
} from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

async function requireAgent(request: Request) {
  return authenticateApiKey(request.headers.get("authorization"));
}

export async function GET(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const folder = await getFolder(agent.userId, id);
    if (!folder) return jsonError(404, "Folder not found.");

    return Response.json({
      folder: {
        id: folder.id,
        name: folder.name,
        created_at: folder.created_at,
      },
    });
  } catch (err) {
    console.error("v1 get folder error", err);
    return jsonError(500, "Could not load folder.");
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const folder = await getFolder(agent.userId, id);
    if (!folder) return jsonError(404, "Folder not found.");

    if (folder.name === DEFAULT_FOLDER_NAME) {
      return jsonError(400, "Cannot rename the default folder.");
    }

    const body = (await request.json().catch(() => null)) as {
      name?: string;
    } | null;
    if (!body) return jsonError(400, "Invalid JSON body.");

    const name = body.name?.trim();
    if (!name) {
      return jsonError(400, "Folder name is required.");
    }

    if (name.toLowerCase() === DEFAULT_FOLDER_NAME.toLowerCase()) {
      return jsonError(400, "Cannot rename to that name.");
    }

    try {
      const updated = await renameFolder(agent.userId, id, name);
      if (!updated) return jsonError(404, "Folder not found.");
      return Response.json({
        ok: true,
        folder: {
          id: updated.id,
          name: updated.name,
          created_at: updated.created_at,
        },
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A folder with that name already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 rename folder error", err);
    return jsonError(500, "Could not rename folder.");
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const folder = await getFolder(agent.userId, id);
    if (!folder) return jsonError(404, "Folder not found.");

    if (folder.name === DEFAULT_FOLDER_NAME) {
      return jsonError(400, "Cannot delete the default folder.");
    }

    const ok = await deleteFolder(agent.userId, id);
    if (!ok) return jsonError(404, "Folder not found.");

    return Response.json({ ok: true });
  } catch (err) {
    console.error("v1 delete folder error", err);
    return jsonError(500, "Could not delete folder.");
  }
}
