import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { createApiKey, listApiKeys } from "@/lib/api-keys";

export async function GET() {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const keys = await listApiKeys(session.user.id);
    return Response.json({ keys });
  } catch (err) {
    console.error("list keys error", err);
    return Response.json({ error: "Could not list API keys." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    resolveAuthSecret();
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as { name?: string };
    const name = String(body.name ?? "Agent key").trim() || "Agent key";
    if (name.length > 80) {
      return Response.json({ error: "Name too long (max 80)." }, { status: 400 });
    }
    const { key, plaintext } = await createApiKey({
      userId: session.user.id,
      name,
    });
    return Response.json({
      ok: true,
      key,
      // Shown once — store only hash server-side
      secret: plaintext,
    });
  } catch (err) {
    console.error("create key error", err);
    return Response.json({ error: "Could not create API key." }, { status: 500 });
  }
}
