import { auth } from "@/auth";
import { getFileForUser } from "@/lib/db";
import {
  enableFileShare,
  getShareStatus,
  revokeFileShare,
} from "@/lib/file-shares";
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
    const share = await getShareStatus(session.user.id, id);
    return Response.json({ share });
  } catch (err) {
    console.error("get share error", err);
    return Response.json({ error: "Could not load share status." }, { status: 500 });
  }
}

export async function POST(_request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const file = await getFileForUser(session.user.id, id);
    if (!file) return Response.json({ error: "Not found" }, { status: 404 });
    const share = await enableFileShare(session.user.id, id);
    return Response.json({ ok: true, share });
  } catch (err) {
    console.error("enable share error", err);
    return Response.json({ error: "Could not create public link." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await ctx.params;
    const file = await getFileForUser(session.user.id, id);
    if (!file) return Response.json({ error: "Not found" }, { status: 404 });
    await revokeFileShare(session.user.id, id);
    return Response.json({
      ok: true,
      share: { enabled: false, slug: null, url: null, created_at: null },
    });
  } catch (err) {
    console.error("revoke share error", err);
    return Response.json({ error: "Could not revoke public link." }, { status: 500 });
  }
}
