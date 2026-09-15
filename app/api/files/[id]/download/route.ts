import { auth } from "@/auth";
import { getFileForUser } from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { id } = await ctx.params;
    const file = await getFileForUser(session.user.id, id);
    if (!file) return new Response("Not found", { status: 404 });

    const mime =
      file.type === "json" ? "application/json; charset=utf-8" : "text/markdown; charset=utf-8";
    return new Response(file.content, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${file.name.replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("download error", err);
    return new Response("Could not download file.", { status: 500 });
  }
}
