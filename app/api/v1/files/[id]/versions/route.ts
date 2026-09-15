import { authenticateApiKey } from "@/lib/api-keys";
import { getFileForUser, listFileVersions } from "@/lib/db";

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

    const versions = await listFileVersions(agent.userId, id);
    return Response.json({
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version,
        created_at: v.created_at,
      })),
    });
  } catch (err) {
    console.error("v1 list versions error", err);
    return jsonError(500, "Could not list versions.");
  }
}
