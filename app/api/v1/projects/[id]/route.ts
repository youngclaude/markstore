import { authenticateApiKey } from "@/lib/api-keys";
import { deleteProject, getProject, updateProject } from "@/lib/projects";

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

    return Response.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
    });
  } catch (err) {
    console.error("v1 get project error", err);
    return jsonError(500, "Could not load project.");
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const body = (await request.json().catch(() => null)) as {
      name?: string;
      description?: string;
    } | null;
    if (!body) return jsonError(400, "Invalid JSON body.");

    if (body.name !== undefined && !body.name.trim()) {
      return jsonError(400, "Project name cannot be empty.");
    }

    try {
      const project = await updateProject(agent.userId, id, {
        name: body.name,
        description: body.description,
      });
      if (!project) return jsonError(404, "Project not found.");
      return Response.json({
        ok: true,
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          created_at: project.created_at,
          updated_at: project.updated_at,
        },
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A project with that name already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 update project error", err);
    return jsonError(500, "Could not update project.");
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const ok = await deleteProject(agent.userId, id);
    if (!ok) return jsonError(404, "Project not found.");

    return Response.json({ ok: true });
  } catch (err) {
    console.error("v1 delete project error", err);
    return jsonError(500, "Could not delete project.");
  }
}
