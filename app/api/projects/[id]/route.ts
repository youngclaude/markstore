import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { deleteProject, getProject, updateProject } from "@/lib/projects";

export async function GET(
  _request: Request,
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

    return Response.json({ project });
  } catch (err) {
    console.error("get project error", err);
    return Response.json({ error: "Could not get project." }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = (await request.json()) as {
      name?: string;
      description?: string;
    };

    const project = await updateProject(session.user.id, id, {
      name: body.name,
      description: body.description,
    });

    if (!project) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    return Response.json({ ok: true, project });
  } catch (err) {
    console.error("update project error", err);
    return Response.json({ error: "Could not update project." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteProject(session.user.id, id);

    if (!deleted) {
      return Response.json({ error: "Project not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete project error", err);
    return Response.json({ error: "Could not delete project." }, { status: 500 });
  }
}
