"use client";

import { useMemo, useState } from "react";

type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

function parseJson(source: string): { value: JsonValue | undefined; error: string | null } {
  try {
    return { value: JSON.parse(source) as JsonValue, error: null };
  } catch (e) {
    return { value: undefined, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
}

function typeColor(v: JsonValue): string {
  if (v === null) return "text-slate-500";
  if (typeof v === "boolean") return "text-amber-300";
  if (typeof v === "number") return "text-cyan-300";
  if (typeof v === "string") return "text-emerald-300";
  if (Array.isArray(v)) return "text-violet-300";
  return "text-sky-300";
}

function preview(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v.length > 48 ? `${v.slice(0, 48)}…` : v);
  if (Array.isArray(v)) return `Array(${v.length})`;
  return `Object(${Object.keys(v).length})`;
}

function Node({
  name,
  value,
  depth,
  defaultOpen,
}: {
  name: string | number | null;
  value: JsonValue;
  depth: number;
  defaultOpen: boolean;
}) {
  const isContainer = value !== null && typeof value === "object";
  const [open, setOpen] = useState(defaultOpen);

  if (!isContainer) {
    return (
      <div className="flex gap-2 font-mono text-[13px] leading-6" style={{ paddingLeft: depth * 16 }}>
        {name !== null ? (
          <span className="text-[#7EB6FF]">{typeof name === "number" ? `[${name}]` : `"${name}"`}</span>
        ) : null}
        {name !== null ? <span className="text-slate-600">:</span> : null}
        <span className={typeColor(value)}>{preview(value)}</span>
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [i, v] as const)
    : Object.entries(value);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 font-mono text-[13px] leading-6 text-left hover:bg-slate-900/60"
        style={{ paddingLeft: depth * 16 }}
      >
        <span className="inline-block w-3 text-slate-500">{open ? "▾" : "▸"}</span>
        {name !== null ? (
          <span className="text-[#7EB6FF]">{typeof name === "number" ? `[${name}]` : `"${name}"`}</span>
        ) : null}
        {name !== null ? <span className="text-slate-600">:</span> : null}
        <span className={typeColor(value)}>
          {Array.isArray(value) ? "[" : "{"}
          {!open ? ` ${preview(value)} ${Array.isArray(value) ? "]" : "}"}` : ""}
        </span>
      </button>
      {open ? (
        <div>
          {entries.map(([k, v]) => (
            <Node
              key={String(k)}
              name={k}
              value={v as JsonValue}
              depth={depth + 1}
              defaultOpen={depth < 1}
            />
          ))}
          <div
            className="font-mono text-[13px] leading-6 text-slate-500"
            style={{ paddingLeft: depth * 16 + 14 }}
          >
            {Array.isArray(value) ? "]" : "}"}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function JsonTree({ source }: { source: string }) {
  const parsed = useMemo(() => parseJson(source), [source]);
  if (parsed.error) {
    return (
      <div className="p-6 text-sm text-rose-300">
        Invalid JSON — switch to Raw to fix.{" "}
        <span className="text-slate-500">({parsed.error})</span>
      </div>
    );
  }
  return (
    <div className="overflow-auto p-4">
      <Node name={null} value={parsed.value as JsonValue} depth={0} defaultOpen />
    </div>
  );
}
