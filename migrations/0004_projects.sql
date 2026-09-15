-- ALL-11: Projects and project-scoped folders

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- Add project_id to folders (nullable for backward compat with general files)
ALTER TABLE folders ADD COLUMN project_id TEXT REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_folders_project ON folders(project_id);
