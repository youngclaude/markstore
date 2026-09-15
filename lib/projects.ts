import { getDb } from "@/lib/db";
import { DEFAULT_FOLDER_NAME } from "@/lib/files-shared";

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectWithStats = ProjectRow & {
  folder_count: number;
  file_count: number;
};

export async function createProject(input: {
  userId: string;
  name: string;
  description?: string | null;
}): Promise<ProjectRow> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await getDb()
    .prepare(
      `INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, input.userId, input.name.trim(), input.description?.trim() || null, now, now)
    .run();

  const project: ProjectRow = {
    id,
    user_id: input.userId,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  await createProjectFolder(input.userId, id, DEFAULT_FOLDER_NAME);

  return project;
}

export async function getProject(
  userId: string,
  projectId: string,
): Promise<ProjectRow | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, user_id, name, description, created_at, updated_at
       FROM projects WHERE id = ? AND user_id = ?`,
    )
    .bind(projectId, userId)
    .first<ProjectRow>();
  return row ?? null;
}

export async function listProjects(userId: string): Promise<ProjectWithStats[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT 
         p.id, p.user_id, p.name, p.description, p.created_at, p.updated_at,
         (SELECT COUNT(*) FROM folders f WHERE f.project_id = p.id) AS folder_count,
         (SELECT COUNT(*) FROM files fi 
          JOIN folders fo ON fi.folder_id = fo.id 
          WHERE fo.project_id = p.id) AS file_count
       FROM projects p
       WHERE p.user_id = ?
       ORDER BY p.updated_at DESC`,
    )
    .bind(userId)
    .all<ProjectWithStats>();
  return results ?? [];
}

export async function updateProject(
  userId: string,
  projectId: string,
  patch: { name?: string; description?: string | null },
): Promise<ProjectRow | null> {
  const existing = await getProject(userId, projectId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const name = patch.name?.trim() ?? existing.name;
  const description = patch.description !== undefined 
    ? (patch.description?.trim() || null) 
    : existing.description;

  await getDb()
    .prepare(
      `UPDATE projects SET name = ?, description = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
    )
    .bind(name, description, now, projectId, userId)
    .run();

  return {
    ...existing,
    name,
    description,
    updated_at: now,
  };
}

export async function deleteProject(userId: string, projectId: string): Promise<boolean> {
  const existing = await getProject(userId, projectId);
  if (!existing) return false;

  await getDb()
    .prepare(
      `DELETE FROM file_versions WHERE file_id IN (
         SELECT fi.id FROM files fi
         JOIN folders fo ON fi.folder_id = fo.id
         WHERE fo.project_id = ?
       )`,
    )
    .bind(projectId)
    .run();

  await getDb()
    .prepare(
      `DELETE FROM files WHERE folder_id IN (
         SELECT id FROM folders WHERE project_id = ?
       )`,
    )
    .bind(projectId)
    .run();

  await getDb()
    .prepare(`DELETE FROM folders WHERE project_id = ?`)
    .bind(projectId)
    .run();

  const result = await getDb()
    .prepare(`DELETE FROM projects WHERE id = ? AND user_id = ?`)
    .bind(projectId, userId)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}

export type ProjectFolderRow = {
  id: string;
  user_id: string;
  name: string;
  project_id: string;
  created_at: string;
};

export async function createProjectFolder(
  userId: string,
  projectId: string,
  name: string,
): Promise<ProjectFolderRow> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await getDb()
    .prepare(
      `INSERT INTO folders (id, user_id, name, project_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, userId, name.trim(), projectId, createdAt)
    .run();
  return {
    id,
    user_id: userId,
    name: name.trim(),
    project_id: projectId,
    created_at: createdAt,
  };
}

export async function listProjectFolders(
  userId: string,
  projectId: string,
): Promise<ProjectFolderRow[]> {
  const { results } = await getDb()
    .prepare(
      `SELECT id, user_id, name, project_id, created_at
       FROM folders
       WHERE user_id = ? AND project_id = ?
       ORDER BY 
         CASE WHEN name = ? THEN 0 ELSE 1 END,
         name COLLATE NOCASE ASC`,
    )
    .bind(userId, projectId, DEFAULT_FOLDER_NAME)
    .all<ProjectFolderRow>();
  return results ?? [];
}

export async function getProjectFolder(
  userId: string,
  folderId: string,
): Promise<(ProjectFolderRow & { project_name: string }) | null> {
  const row = await getDb()
    .prepare(
      `SELECT f.id, f.user_id, f.name, f.project_id, f.created_at, p.name AS project_name
       FROM folders f
       JOIN projects p ON p.id = f.project_id
       WHERE f.id = ? AND f.user_id = ? AND f.project_id IS NOT NULL`,
    )
    .bind(folderId, userId)
    .first<ProjectFolderRow & { project_name: string }>();
  return row ?? null;
}

export async function findProjectFolderByName(
  userId: string,
  projectId: string,
  name: string,
): Promise<ProjectFolderRow | null> {
  const row = await getDb()
    .prepare(
      `SELECT id, user_id, name, project_id, created_at
       FROM folders
       WHERE user_id = ? AND project_id = ? AND name = ?`,
    )
    .bind(userId, projectId, name)
    .first<ProjectFolderRow>();
  return row ?? null;
}

export async function deleteProjectFolder(
  userId: string,
  folderId: string,
): Promise<boolean> {
  const folder = await getProjectFolder(userId, folderId);
  if (!folder) return false;
  if (folder.name === DEFAULT_FOLDER_NAME) return false;

  await getDb()
    .prepare(
      `DELETE FROM file_versions WHERE file_id IN (
         SELECT id FROM files WHERE folder_id = ?
       )`,
    )
    .bind(folderId)
    .run();

  await getDb()
    .prepare(`DELETE FROM files WHERE folder_id = ?`)
    .bind(folderId)
    .run();

  const result = await getDb()
    .prepare(`DELETE FROM folders WHERE id = ? AND user_id = ?`)
    .bind(folderId, userId)
    .run();

  return (result.meta?.changes ?? 0) > 0;
}

export async function renameProjectFolder(
  userId: string,
  folderId: string,
  newName: string,
): Promise<ProjectFolderRow | null> {
  const folder = await getProjectFolder(userId, folderId);
  if (!folder) return null;
  if (folder.name === DEFAULT_FOLDER_NAME) return null;
  const trimmed = newName.trim();
  if (!trimmed) return null;
  await getDb()
    .prepare(`UPDATE folders SET name = ? WHERE id = ? AND user_id = ?`)
    .bind(trimmed, folderId, userId)
    .run();
  return {
    id: folder.id,
    user_id: folder.user_id,
    name: trimmed,
    project_id: folder.project_id,
    created_at: folder.created_at,
  };
}

export type ProjectFileRow = {
  id: string;
  user_id: string;
  folder_id: string;
  name: string;
  type: "md" | "json";
  content: string;
  size: number;
  updated_at: string;
  created_at: string;
  folder_name: string;
};

export async function listProjectFiles(
  userId: string,
  projectId: string,
  folderId?: string,
): Promise<ProjectFileRow[]> {
  if (folderId) {
    const { results } = await getDb()
      .prepare(
        `SELECT f.id, f.user_id, f.folder_id, f.name, f.type, f.content, f.size, 
                f.updated_at, f.created_at, fo.name AS folder_name
         FROM files f
         JOIN folders fo ON fo.id = f.folder_id
         WHERE f.user_id = ? AND f.folder_id = ? AND fo.project_id = ?
         ORDER BY f.name COLLATE NOCASE ASC`,
      )
      .bind(userId, folderId, projectId)
      .all<ProjectFileRow>();
    return results ?? [];
  }

  const { results } = await getDb()
    .prepare(
      `SELECT f.id, f.user_id, f.folder_id, f.name, f.type, f.content, f.size,
              f.updated_at, f.created_at, fo.name AS folder_name
       FROM files f
       JOIN folders fo ON fo.id = f.folder_id
       WHERE f.user_id = ? AND fo.project_id = ?
       ORDER BY fo.name COLLATE NOCASE ASC, f.name COLLATE NOCASE ASC`,
    )
    .bind(userId, projectId)
    .all<ProjectFileRow>();
  return results ?? [];
}
