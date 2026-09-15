import { authenticateApiKey } from "@/lib/api-keys";
import { getFileForUser } from "@/lib/db";
import {
  enableFileShare,
  getShareStatus,
  revokeFileShare,
} from "@/lib/file-shares";

type Ctx = { params: Promise<{ id: string }> };

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

    const { id } = await ctx.params;
    const file = await getFileForUser(agent.userId, id);
    if (!file) return jsonError(404, "File not found.");

    const share = await getShareStatus(agent.userId, id);
    return Response.json({ share });
  } catch (err) {
    console.error("v1 get share error", err);
    return jsonError(500, "Could not load share status.");
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const file = await getFileForUser(agent.userId, id);
    if (!file) return jsonError(404, "File not found.");

    const share = await enableFileShare(agent.userId, id);
    return Response.json({ ok: true, share });
  } catch (err) {
    console.error("v1 enable share error", err);
    return jsonError(500, "Could not create public link.");
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");

    const { id } = await ctx.params;
    const file = await getFileForUser(agent.userId, id);
    if (!file) return jsonError(404, "File not found.");

    await revokeFileShare(agent.userId, id);
    return Response.json({
      ok: true,
      share: { enabled: false, slug: null, url: null, created_at: null },
    });
  } catch (err) {
    console.error("v1 revoke share error", err);
    return jsonError(500, "Could not revoke public link.");
  }
}
