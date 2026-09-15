import { getPublicSharedFile } from "@/lib/file-shares";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const file = await getPublicSharedFile(slug);
    if (!file) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({
      file: {
        slug: file.slug,
        name: file.name,
        type: file.type,
        content: file.content,
        size: file.size,
        updated_at: file.updated_at,
      },
    });
  } catch (err) {
    console.error("public share get error", err);
    return Response.json({ error: "Could not load shared file." }, { status: 500 });
  }
}
