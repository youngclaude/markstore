import { auth } from "@/auth";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { getDb, type FileRow, type FolderRow } from "@/lib/db";
import type { ProjectRow } from "@/lib/projects";

export type SearchResultItem = {
  id: string;
  name: string;
  type: "file" | "folder" | "project";
  fileType?: "md" | "json";
  path: string;
  updatedAt?: string;
};

export type SearchResponse = {
  query: string;
  results: SearchResultItem[];
};

export async function GET(request: Request) {
  try {
    resolveAuthSecret();
  } catch {
    /* process.env may already have AUTH_SECRET */
  }

  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return Response.json({ query: "", results: [] } satisfies SearchResponse);
  }

  const userId = session.user.id;
  const db = getDb();
  const searchPattern = `%${query}%`;

  const results: SearchResultItem[] = [];

  const { results: files } = await db
    .prepare(
      `SELECT f.id, f.name, f.type, f.updated_at, fo.name AS folder_name, fo.project_id, p.name AS project_name
       FROM files f
       JOIN folders fo ON fo.id = f.folder_id
       LEFT JOIN projects p ON p.id = fo.project_id
       WHERE f.user_id = ? AND f.name LIKE ?
       ORDER BY f.updated_at DESC
       LIMIT 20`,
    )
    .bind(userId, searchPattern)
    .all<
      FileRow & {
        folder_name: string;
        project_id: string | null;
        project_name: string | null;
      }
    >();

  for (const file of files ?? []) {
    const basePath = file.project_id
      ? `/${file.project_name}/${file.folder_name}`
      : `/${file.folder_name}`;
    results.push({
      id: file.id,
      name: file.name,
      type: "file",
      fileType: file.type as "md" | "json",
      path: `${basePath}/${file.name}`,
      updatedAt: file.updated_at,
    });
  }

  const { results: folders } = await db
    .prepare(
      `SELECT fo.id, fo.name, fo.project_id, p.name AS project_name
       FROM folders fo
       LEFT JOIN projects p ON p.id = fo.project_id
       WHERE fo.user_id = ? AND fo.name LIKE ?
       ORDER BY fo.created_at DESC
       LIMIT 10`,
    )
    .bind(userId, searchPattern)
    .all<FolderRow & { project_name: string | null }>();

  for (const folder of folders ?? []) {
    const basePath = folder.project_id ? `/${folder.project_name}` : "";
    results.push({
      id: folder.id,
      name: folder.name,
      type: "folder",
      path: `${basePath}/${folder.name}/`,
    });
  }

  const { results: projects } = await db
    .prepare(
      `SELECT id, name, updated_at
       FROM projects
       WHERE user_id = ? AND name LIKE ?
       ORDER BY updated_at DESC
       LIMIT 10`,
    )
    .bind(userId, searchPattern)
    .all<ProjectRow>();

  for (const project of projects ?? []) {
    results.push({
      id: project.id,
      name: project.name,
      type: "project",
      path: `/${project.name}/`,
      updatedAt: project.updated_at,
    });
  }

  results.sort((a, b) => {
    const aTime = a.updatedAt ?? "";
    const bTime = b.updatedAt ?? "";
    return bTime.localeCompare(aTime);
  });

  return Response.json({
    query,
    results: results.slice(0, 25),
  } satisfies SearchResponse);
}
