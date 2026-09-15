"use client";

export function EditorPane({
  content,
  lineCount,
  onChange,
}: {
  content: string;
  lineCount: number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="absolute inset-0 flex font-mono text-[13px] leading-6">
      <div
        aria-hidden
        className="select-none border-r border-slate-800/80 bg-[#080A0F] px-3 py-4 text-right text-slate-600"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="h-full w-full resize-none bg-transparent px-4 py-4 text-slate-100 outline-none"
        style={{ tabSize: 2 }}
      />
    </div>
  );
}

export function RawView({ content, lineCount }: { content: string; lineCount: number }) {
  const lines = content.split("\n");
  return (
    <div className="absolute inset-0 flex overflow-auto font-mono text-[13px] leading-6">
      <div
        aria-hidden
        className="sticky left-0 select-none border-r border-slate-800/80 bg-[#080A0F] px-3 py-4 text-right text-slate-600"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="m-0 flex-1 whitespace-pre-wrap px-4 py-4 text-slate-300">
        {lines.map((line, i) => (
          <div key={i}>{line.length ? line : " "}</div>
        ))}
      </pre>
    </div>
  );
}
