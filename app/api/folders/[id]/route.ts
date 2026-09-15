import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { deleteFolder, getFolder, renameFolder } from "@/lib/db";

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
    const folder = await getFolder(session.user.id, id);
    if (!folder) {
      return Response.json({ error: "Folder not found." }, { status: 404 });
    }

    return Response.json({ folder });
  } catch (err) {
    console.error("get folder error", err);
    return Response.json({ error: "Could not get folder." }, { status: 500 });
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
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim();

    if (!name) {
      return Response.json({ error: "Folder name is required." }, { status: 400 });
    }

    const folder = await renameFolder(session.user.id, id, name);
    if (!folder) {
      return Response.json({ error: "Folder not found or cannot be renamed." }, { status: 404 });
    }

    return Response.json({ ok: true, folder });
  } catch (err) {
    const msg = String(err);
    if (msg.includes("UNIQUE") || msg.includes("constraint")) {
      return Response.json(
        { error: "A folder with that name already exists." },
        { status: 409 },
      );
    }
    console.error("rename folder error", err);
    return Response.json({ error: "Could not rename folder." }, { status: 500 });
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
    const deleted = await deleteFolder(session.user.id, id);
    if (!deleted) {
      return Response.json(
        { error: "Folder not found or cannot be deleted." },
        { status: 404 },
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete folder error", err);
    return Response.json({ error: "Could not delete folder." }, { status: 500 });
  }
}
