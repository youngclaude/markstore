import { authenticateApiKey } from "@/lib/api-keys";
import {
  createProjectFolder,
  getProject,
  listProjectFolders,
} from "@/lib/projects";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";

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
    const project = await getProject(agent.userId, id);
    if (!project) return jsonError(404, "Project not found.");

    const folders = await listProjectFolders(agent.userId, id);
    return Response.json({
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        project_id: f.project_id,
        created_at: f.created_at,
      })),
    });
  } catch (err) {
    console.error("v1 list project folders error", err);
    return jsonError(500, "Could not list folders.");
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const project = await getProject(agent.userId, id);
    if (!project) return jsonError(404, "Project not found.");

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
      const folder = await createProjectFolder(agent.userId, id, name);
      return Response.json(
        {
          ok: true,
          folder: {
            id: folder.id,
            name: folder.name,
            project_id: folder.project_id,
            created_at: folder.created_at,
          },
        },
        { status: 201 },
      );
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A folder with that name already exists in this project.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 create project folder error", err);
    return jsonError(500, "Could not create folder.");
  }
}
