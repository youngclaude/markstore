import { authenticateApiKey } from "@/lib/api-keys";
import { getFileForUser } from "@/lib/db";
import { deleteFile, updateFileMeta } from "@/lib/files-agent";

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
    if (!file) return jsonError(404, "Not found");
    return Response.json({
      file: {
        id: file.id,
        name: file.name,
        type: file.type,
        folder_id: file.folder_id,
        folder_name: file.folder_name,
        size: file.size,
        updated_at: file.updated_at,
        created_at: file.created_at,
        content: file.content,
      },
    });
  } catch (err) {
    console.error("v1 get file error", err);
    return jsonError(500, "Could not load file.");
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");
    const { id } = await ctx.params;
    const body = (await request.json().catch(() => null)) as {
      content?: string;
      name?: string;
    } | null;
    if (!body) return jsonError(400, "Invalid JSON body.");
    if (body.content === undefined && body.name === undefined) {
      return jsonError(400, "Provide content and/or name.");
    }

    const existing = await getFileForUser(agent.userId, id);
    if (!existing) return jsonError(404, "Not found");

    if (typeof body.content === "string" && existing.type === "json") {
      try {
        JSON.parse(body.content);
      } catch (e) {
        return jsonError(
          400,
          e instanceof Error ? `Invalid JSON: ${e.message}` : "Invalid JSON",
        );
      }
    }

    try {
      const file = await updateFileMeta(agent.userId, id, {
        content: body.content,
        name: body.name,
      });
      if (!file) return jsonError(404, "Not found");
      return Response.json({
        ok: true,
        file: {
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          updated_at: file.updated_at,
          version: file.version ?? null,
        },
      });
    } catch (err) {
      const msg = String(err);
      if (msg.includes("UNIQUE") || msg.includes("constraint")) {
        return jsonError(409, "A file with that name already exists.");
      }
      throw err;
    }
  } catch (err) {
    console.error("v1 patch file error", err);
    return jsonError(500, "Could not update file.");
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  try {
    const agent = await requireAgent(request);
    if (!agent) return jsonError(401, "Unauthorized — provide Authorization: Bearer msk_…");
    const { id } = await ctx.params;
    const ok = await deleteFile(agent.userId, id);
    if (!ok) return jsonError(404, "Not found");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("v1 delete file error", err);
    return jsonError(500, "Could not delete file.");
  }
}
