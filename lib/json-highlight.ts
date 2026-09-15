/** Escape HTML then lightly highlight JSON for read-only public viewers. */
export function highlightJson(source: string): string {
  let pretty = source;
  try {
    pretty = JSON.stringify(JSON.parse(source), null, 2);
  } catch {
    // keep raw
  }

  const escaped = pretty
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Tokenize roughly: strings, then numbers/bools/null
  return escaped.replace(
    /(" (?:\\.|[^"\\])*")(\s*:)?|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false|null)\b/g,
    (match, str: string | undefined, colon: string | undefined, num: string | undefined, lit: string | undefined) => {
      if (str !== undefined) {
        if (colon) {
          return `<span class="json-key">${str}</span>${colon}`;
        }
        return `<span class="json-str">${str}</span>`;
      }
      if (num !== undefined) return `<span class="json-num">${num}</span>`;
      if (lit !== undefined) return `<span class="json-lit">${lit}</span>`;
      return match;
    },
  );
}
