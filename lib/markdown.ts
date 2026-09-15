import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: false,
});

/** Render Markdown to HTML (Workers-safe, client-safe). */
export function renderMarkdown(source: string): string {
  try {
    return marked.parse(source, { async: false }) as string;
  } catch {
    return "<p>Could not render markdown.</p>";
  }
}
