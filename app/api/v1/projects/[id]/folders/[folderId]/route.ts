import { authenticateApiKey } from "@/lib/api-keys";
import {
  deleteProjectFolder,
  getProject,
  getProjectFolder,
  renameProjectFolder,
} from "@/lib/projects";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";

type Ctx = { params: Promise<{ id: string; folderId: string }> };

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

    const { id, folderId } = await ctx.params;
    const project = await getProject(agent.userId, id);
    if (!project) return jsonError(404, "Project not found.");

    const folder = await getProjectFolder(agent.userId, folderId);
    if (!folder || folder.project_id !== id) return jsonError(404, "Folder not found.");

    return Response.json({
      folder: {
        id: folder.id,
        name: folder.name,
        project_id: folder.project_id,
        created_at: folder.created_at,
      },
    });
  } catch (err) {
    console.error("v1 get project folder error", err);
    return jsonError(500, "Could not load folder.");
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id, folderId } = await ctx.params;
    const project = await getProject(agent.userId, id);
    if (!project) return jsonError(404, "Project not found.");

    const folder = await getProjectFolder(agent.userId, folderId);
    if (!folder || folder.project_id !== id) return jsonError(404, "Folder not found.");

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
      const updated = await renameProjectFolder(agent.userId, folderId, name);
      if (!updated) return jsonError(404, "Folder not found.");
      return Response.json({
        ok: true,
        folder: {
          id: updated.id,
          name: updated.name,
          project_id: updated.project_id,
          created_at: updated.created_at,
        },
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A folder with that name already exists in this project.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 rename project folder error", err);
    return jsonError(500, "Could not rename folder.");
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id, folderId } = await ctx.params;
    const project = await getProject(agent.userId, id);
    if (!project) return jsonError(404, "Project not found.");

    const folder = await getProjectFolder(agent.userId, folderId);
    if (!folder || folder.project_id !== id) return jsonError(404, "Folder not found.");

    if (folder.name === DEFAULT_FOLDER_NAME) {
      return jsonError(400, "Cannot delete the default folder.");
    }

    const ok = await deleteProjectFolder(agent.userId, folderId);
    if (!ok) return jsonError(404, "Folder not found.");

    return Response.json({ ok: true });
  } catch (err) {
    console.error("v1 delete project folder error", err);
    return jsonError(500, "Could not delete folder.");
  }
}
