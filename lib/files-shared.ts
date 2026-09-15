export const DEFAULT_FOLDER_NAME = "general files";

export type FileType = "md" | "json";

export function normalizeFileName(raw: string, type: FileType): string {
  let name = raw.trim().replace(/[/\\]/g, "");
  if (!name) name = "untitled";
  const ext = type === "md" ? ".md" : ".json";
  const lower = name.toLowerCase();
  if (type === "md" && !lower.endsWith(".md")) name = `${name}${ext}`;
  if (type === "json" && !lower.endsWith(".json")) name = `${name}${ext}`;
  return name;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatModified(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
