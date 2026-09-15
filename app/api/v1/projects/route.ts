import { authenticateApiKey } from "@/lib/api-keys";
import { createProject, listProjects } from "@/lib/projects";

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

    const projects = await listProjects(agent.userId);
    return Response.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        folder_count: p.folder_count,
        file_count: p.file_count,
        created_at: p.created_at,
        updated_at: p.updated_at,
      })),
    });
  } catch (err) {
    console.error("v1 list projects error", err);
    return jsonError(500, "Could not list projects.");
  }
}

export async function POST(request: Request) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const body = (await request.json().catch(() => null)) as {
      name?: string;
      description?: string;
    } | null;
    if (!body) return jsonError(400, "Invalid JSON body.");

    const name = body.name?.trim();
    if (!name) {
      return jsonError(400, "Project name is required.");
    }

    try {
      const project = await createProject({
        userId: agent.userId,
        name,
        description: body.description,
      });
      return Response.json(
        {
          ok: true,
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            created_at: project.created_at,
            updated_at: project.updated_at,
          },
        },
        { status: 201 },
      );
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A project with that name already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 create project error", err);
    return jsonError(500, "Could not create project.");
  }
}
