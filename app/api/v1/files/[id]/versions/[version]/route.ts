import { authenticateApiKey } from "@/lib/api-keys";
import {
  getFileVersion,
  getPreviousFileVersion,
  restoreFileVersion,
} from "@/lib/db";

type Ctx = { params: Promise<{ id: string; version: string }> };

function jsonError(status: number, error: string) {
  return Response.json({ error }, { status });
}

async function requireAgent(request: Request) {
  return authenticateApiKey(request.headers.get("authorization"));
}

export async function GET(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id, version: versionRaw } = await ctx.params;
    const version = Number.parseInt(versionRaw, 10);
    if (!Number.isFinite(version)) {
      return jsonError(400, "Invalid version number.");
    }

    const snap = await getFileVersion(agent.userId, id, version);
    if (!snap) return jsonError(404, "Version not found.");

    const prev = await getPreviousFileVersion(agent.userId, id, version);
    return Response.json({
      version: {
        id: snap.id,
        version: snap.version,
        content: snap.content,
        created_at: snap.created_at,
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
    console.error("v1 get version error", err);
    return jsonError(500, "Could not load version.");
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id, version: versionRaw } = await ctx.params;
    const version = Number.parseInt(versionRaw, 10);
    if (!Number.isFinite(version)) {
      return jsonError(400, "Invalid version number.");
    }

    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action !== "restore") {
      return jsonError(400, "Unsupported action. Use { \"action\": \"restore\" }.");
    }

    const file = await restoreFileVersion(agent.userId, id, version);
    if (!file) return jsonError(404, "Version not found.");

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
    console.error("v1 restore version error", err);
    return jsonError(500, "Could not restore version.");
  }
}
