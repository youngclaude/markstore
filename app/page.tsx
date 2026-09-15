import Link from "next/link";

const files = [
  { name: "CLAUDE.md", type: "Markdown", modified: "2m ago", kind: "md" },
  { name: "AGENTS.md", type: "Markdown", modified: "1h ago", kind: "md" },
  { name: "memory/", type: "Folder", modified: "3h ago", kind: "folder" },
  { name: "MEMORY.md", type: "Markdown", modified: "Yesterday", kind: "md" },
  { name: "agent-config.json", type: "JSON", modified: "2d ago", kind: "json" },
];

const features = [
  {
    title: "Sync",
    body: "Keep your files in sync across all your devices and environments.",
    icon: "☁️",
  },
  {
    title: "Version history",
    body: "Track changes, roll back when needed, and never lose your context.",
    icon: "🕒",
  },
  {
    title: "API access",
    body: "Integrate with your tools and workflows using a simple, powerful API.",
    icon: "</>",
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="relative inline-flex h-5 w-5">
        <span className="absolute left-0 top-0 h-[14px] w-[14px] rounded-[3px] bg-[#1D7BFF]" />
        <span className="absolute left-1 top-1 h-[14px] w-[14px] rounded-[3px] bg-[#4F9DFF]" />
        <span className="absolute left-2 top-2 h-[14px] w-[14px] rounded-[3px] bg-[#7BB6FF]" />
      </span>
      MarkStore
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0E14] text-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <Link href="/docs" className="hover:text-white">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/signin" className="hidden text-slate-300 hover:text-white sm:inline">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#1D7BFF] px-3.5 py-2 font-medium text-white hover:bg-blue-500"
          >
            Start storing →
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block text-white">Your AI&apos;s memory,</span>
            <span className="block bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              everywhere.
            </span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-400">
            Store, sync, version, and access the Markdown and JSON files that make your AI agents
            smarter.
          </p>
          <div>
            <Link
              href="/signup"
              className="inline-flex rounded-xl bg-[#1D7BFF] px-5 py-3 text-base font-medium text-white hover:bg-blue-500"
            >
              Start storing →
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950 shadow-2xl shadow-blue-950/40">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 text-xs text-slate-500">MarkStore</span>
          </div>
          <div className="grid min-h-[320px] sm:grid-cols-[160px_1fr]">
            <aside className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
              <p className="mb-3 text-xs font-semibold text-slate-400">MarkStore</p>
              <ul className="space-y-1 text-sm">
                <li className="rounded-md bg-[#1D7BFF]/20 px-2 py-1.5 text-blue-200">Files</li>
                <li className="px-2 py-1.5 text-slate-400">Versions</li>
                <li className="px-2 py-1.5 text-slate-400">Settings</li>
              </ul>
              <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Synced · 2m ago
              </div>
            </aside>
            <div className="p-3">
              <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr] gap-2 border-b border-slate-800 px-2 pb-2 text-xs uppercase tracking-wide text-slate-500">
                <span>Name</span>
                <span>Type</span>
                <span>Modified</span>
              </div>
              <ul className="divide-y divide-slate-800/80">
                {files.map((file) => (
                  <li
                    key={file.name}
                    className="grid grid-cols-[1.4fr_0.7fr_0.7fr] items-center gap-2 px-2 py-2.5 text-sm"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-[10px] font-semibold text-blue-300">
                        {file.kind === "json" ? "{}" : file.kind === "folder" ? "📁" : "MD"}
                      </span>
                      {file.name}
                    </span>
                    <span className="text-slate-400">{file.type}</span>
                    <span className="text-slate-500">{file.modified}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-6"
            >
              <div className="mb-4 text-2xl text-[#1D7BFF]">{feature.icon}</div>
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer id="docs" className="border-t border-slate-800/80 px-6 py-8 text-center text-sm text-slate-500">
        <p id="pricing">MarkStore MVP · usemarkstore.com</p>
      </footer>
    </main>
  );
}
