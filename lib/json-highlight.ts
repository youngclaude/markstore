/** Escape HTML then lightly highlight JSON for read-only public viewers. */
export function highlightJson(source: string): string {
  let pretty = source;
  try {
    pretty = JSON.stringify(JSON.parse(source), null, 2);
  } catch {
    // keep raw
  }

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let out = "";
  let i = 0;
  const s = pretty;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === '"') {
      let j = i + 1;
      while (j < s.length) {
        if (s[j] === "\\" && j + 1 < s.length) {
          j += 2;
          continue;
        }
        if (s[j] === '"') break;
        j++;
      }
      const raw = s.slice(i, Math.min(j + 1, s.length));
      let k = j + 1;
      while (k < s.length && /\s/.test(s[k]!)) k++;
      if (s[k] === ":") {
        out += '<span class="json-key">' + esc(raw) + "</span>";
      } else {
        out += '<span class="json-str">' + esc(raw) + "</span>";
      }
      i = j + 1;
      continue;
    }
    if (/[0-9-]/.test(ch)) {
      let j = i + 1;
      while (j < s.length && /[0-9.eE+-]/.test(s[j]!)) j++;
      out += '<span class="json-num">' + esc(s.slice(i, j)) + "</span>";
      i = j;
      continue;
    }
    if (s.startsWith("true", i) && !/[A-Za-z0-9_]/.test(s[i + 4] ?? "")) {
      out += '<span class="json-lit">true</span>';
      i += 4;
      continue;
    }
    if (s.startsWith("false", i) && !/[A-Za-z0-9_]/.test(s[i + 5] ?? "")) {
      out += '<span class="json-lit">false</span>';
      i += 5;
      continue;
    }
    if (s.startsWith("null", i) && !/[A-Za-z0-9_]/.test(s[i + 4] ?? "")) {
      out += '<span class="json-lit">null</span>';
      i += 4;
      continue;
    }
    out += esc(ch);
    i++;
  }
  return out;
}
