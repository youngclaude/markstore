import Link from "next/link";

const features = [
  {
    title: "Quickstart",
    description: "Make your first API request and start storing files in minutes.",
    href: "/docs/quickstart",
    icon: <BoltIcon className="h-5 w-5" />,
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-500/15",
  },
  {
    title: "API keys",
    description: "Create and manage your API keys (msk_…) to authenticate requests.",
    href: "/docs/api#authentication",
    icon: <KeyIcon className="h-5 w-5" />,
    color: "from-violet-400 to-purple-500",
    bgColor: "bg-violet-500/15",
  },
  {
    title: "Files",
    description: "Upload, download, and manage files with our simple API.",
    href: "/docs/api#files",
    icon: <FileIcon className="h-5 w-5" />,
    color: "from-emerald-400 to-green-500",
    bgColor: "bg-emerald-500/15",
  },
  {
    title: "Folders",
    description: "Organize your files with folders and keep your storage tidy.",
    href: "/docs/api#folders",
    icon: <FolderIcon className="h-5 w-5" />,
    color: "from-pink-400 to-rose-500",
    bgColor: "bg-pink-500/15",
  },
  {
    title: "Projects",
    description: "Group your content into projects for better organization and sharing.",
    href: "/docs/api#projects",
    icon: <GridIcon className="h-5 w-5" />,
    color: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-500/15",
  },
];

const curlExample = `curl -X POST https://usemarkstore.com/api/v1/files \\
  -H "Authorization: Bearer msk_1234567890abcdef" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "example.md", "type": "md", "content": "# Hello"}'`;

export default function DocsHome() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1D7BFF]">
            Documentation
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Build with the
            <br />
            <span className="bg-gradient-to-r from-[#1D7BFF] to-cyan-400 bg-clip-text text-transparent">
              MarkStore API.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
            Power your applications with secure, reliable storage for files, folders and projects.
            Get started quickly with our well-documented API and simple authentication.
          </p>
          <div className="mt-8">
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1D7BFF] px-5 py-3 font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Start storing
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#1D7BFF]/20 via-transparent to-cyan-500/10 blur-xl" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-[#080a0f] shadow-2xl shadow-blue-950/30">
            <div className="flex items-center gap-2 border-b border-slate-800/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs text-slate-500">curl</span>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
              <code className="text-slate-300">{curlExample}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group flex flex-col rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 transition-all hover:border-slate-700 hover:bg-slate-900/50"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${feature.bgColor}`}
              >
                <span className={`bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`}>
                  {feature.icon}
                </span>
              </div>
              <h2 className="font-semibold text-white">{feature.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#1D7BFF] group-hover:text-blue-400">
                {feature.title === "Quickstart" ? "Get started" : `View ${feature.title.toLowerCase()} endpoints`}
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-20 border-t border-slate-800/60 pt-8 text-center">
        <p className="text-sm text-slate-500">
          MarkStore API · usemarkstore.com
        </p>
      </footer>
    </div>
  );
}

function ArrowRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function BoltIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function KeyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function FileIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
      <path d="M13 2v7h7" />
    </svg>
  );
}

function FolderIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}

function GridIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
