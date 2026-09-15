import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { createFolder, listFolders } from "@/lib/db";

export async function GET() {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = await listFolders(session.user.id);
    return Response.json({ folders });
  } catch (err) {
    console.error("list folders error", err);
    return Response.json({ error: "Could not list folders." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: string;
      parentId?: string;
    };

    const name = body.name?.trim();
    if (!name) {
      return Response.json({ error: "Folder name is required." }, { status: 400 });
    }

    try {
      const folder = await createFolder(session.user.id, name, body.parentId ?? null);
      return Response.json({ ok: true, folder }, { status: 201 });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return Response.json(
          { error: "A folder with that name already exists." },
          { status: 409 },
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("create folder error", err);
    return Response.json({ error: "Could not create folder." }, { status: 500 });
  }
}
