-- ALL-24: Nested folders support
-- Add parent_id to folders for hierarchical folder structure

ALTER TABLE folders ADD COLUMN parent_id TEXT REFERENCES folders(id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
