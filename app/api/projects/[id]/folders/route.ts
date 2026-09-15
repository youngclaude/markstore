import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import {
  createProjectFolder,
  getProject,
  listProjectFolders,
} from "@/lib/projects";

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

    const folders = await listProjectFolders(session.user.id, id);
    return Response.json({ folders });
  } catch (err) {
    console.error("list project folders error", err);
    return Response.json({ error: "Could not list folders." }, { status: 500 });
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

    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();
    if (!name) {
      return Response.json({ error: "Folder name is required." }, { status: 400 });
    }

    try {
      const folder = await createProjectFolder(session.user.id, id, name);
      return Response.json({ ok: true, folder }, { status: 201 });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return Response.json(
          { error: "A folder with that name already exists in this project." },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("create project folder error", err);
    return Response.json({ error: "Could not create folder." }, { status: 500 });
  }
}
