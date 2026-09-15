import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { revokeApiKey } from "@/lib/api-keys";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const ok = await revokeApiKey(session.user.id, id);
    if (!ok) {
      return Response.json({ error: "Key not found or already revoked." }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("revoke key error", err);
    return Response.json({ error: "Could not revoke API key." }, { status: 500 });
  }
}
