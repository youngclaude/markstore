import { auth } from "@/auth";
import {
  getFileVersion,
  getPreviousFileVersion,
  restoreFileVersion,
} from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

type Ctx = { params: Promise<{ id: string; version: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, version: versionRaw } = await ctx.params;
    const version = Number.parseInt(versionRaw, 10);
    if (!Number.isFinite(version)) {
      return Response.json({ error: "Invalid version" }, { status: 400 });
    }
    const snap = await getFileVersion(session.user.id, id, version);
    if (!snap) return Response.json({ error: "Not found" }, { status: 404 });
    const prev = await getPreviousFileVersion(session.user.id, id, version);
    return Response.json({
      version: {
        id: snap.id,
        version: snap.version,
        content: snap.content,
        created_at: snap.created_at,
        user_id: snap.user_id,
      },
      previous: prev
        ? {
            id: prev.id,
            version: prev.version,
            content: prev.content,
            created_at: prev.created_at,
          }
        : null,
    });
  } catch (err) {
    console.error("get version error", err);
    return Response.json({ error: "Could not load version." }, { status: 500 });
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, version: versionRaw } = await ctx.params;
    const version = Number.parseInt(versionRaw, 10);
    if (!Number.isFinite(version)) {
      return Response.json({ error: "Invalid version" }, { status: 400 });
    }
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action !== "restore") {
      return Response.json({ error: "Unsupported action" }, { status: 400 });
    }
    const file = await restoreFileVersion(session.user.id, id, version);
    if (!file) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({
      ok: true,
      file: {
        id: file.id,
        name: file.name,
        size: file.size,
        updated_at: file.updated_at,
        version: file.version,
      },
    });
  } catch (err) {
    console.error("restore version error", err);
    return Response.json({ error: "Could not restore version." }, { status: 500 });
  }
}
