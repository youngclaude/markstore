/** Line-based Myers-ish LCS diff for version history (ALL-7). */

export type DiffOp =
  | { type: "equal"; line: string; oldLine: number; newLine: number }
  | { type: "add"; line: string; newLine: number }
  | { type: "remove"; line: string; oldLine: number };

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  return dp;
}

export function lineDiff(oldText: string, newText: string): DiffOp[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  // Cap pathological cases for Workers CPU
  if (a.length * b.length > 400_000) {
    return coarseDiff(a, b);
  }
  const dp = lcsTable(a, b);
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  let oldLine = 1;
  let newLine = 1;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", line: a[i], oldLine, newLine });
      i++;
      j++;
      oldLine++;
      newLine++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "remove", line: a[i], oldLine });
      i++;
      oldLine++;
    } else {
      ops.push({ type: "add", line: b[j], newLine });
      j++;
      newLine++;
    }
  }
  while (i < a.length) {
    ops.push({ type: "remove", line: a[i], oldLine });
    i++;
    oldLine++;
  }
  while (j < b.length) {
    ops.push({ type: "add", line: b[j], newLine });
    j++;
    newLine++;
  }
  return ops;
}

function coarseDiff(a: string[], b: string[]): DiffOp[] {
  const ops: DiffOp[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    const oldLine = i < a.length ? a[i] : undefined;
    const newLine = i < b.length ? b[i] : undefined;
    if (oldLine !== undefined && newLine !== undefined && oldLine === newLine) {
      ops.push({ type: "equal", line: oldLine, oldLine: i + 1, newLine: i + 1 });
    } else {
      if (oldLine !== undefined) ops.push({ type: "remove", line: oldLine, oldLine: i + 1 });
      if (newLine !== undefined) ops.push({ type: "add", line: newLine, newLine: i + 1 });
    }
  }
  return ops;
}

export function relativeTime(iso: string, now = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const sec = Math.round((now - t) / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24);
  if (day === 1) return "Yesterday";
  if (day < 14) return `${day} days ago`;
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
