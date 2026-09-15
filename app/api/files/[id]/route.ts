import { auth } from "@/auth";
import { getFileForUser, updateFileContent } from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const file = await getFileForUser(session.user.id, id);
    if (!file) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ file });
  } catch (err) {
    console.error("get file error", err);
    return Response.json({ error: "Could not load file." }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const body = (await request.json()) as { content?: string };
    if (typeof body.content !== "string") {
      return Response.json({ error: "content is required" }, { status: 400 });
    }
    const file = await updateFileContent(session.user.id, id, body.content);
    if (!file) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({
      ok: true,
      file: { id: file.id, name: file.name, size: file.size, updated_at: file.updated_at },
    });
  } catch (err) {
    console.error("save file error", err);
    return Response.json({ error: "Could not save file." }, { status: 500 });
  }
}
