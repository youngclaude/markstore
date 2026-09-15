import { auth } from "@/auth";
import { getFileForUser, listFileVersions } from "@/lib/db";
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
    const versions = await listFileVersions(session.user.id, id);
    return Response.json({
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version,
        created_at: v.created_at,
        email: v.email ?? null,
      })),
    });
  } catch (err) {
    console.error("list versions error", err);
    return Response.json({ error: "Could not list versions." }, { status: 500 });
  }
}
