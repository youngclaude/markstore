import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";
import { DocsSidebar } from "@/components/docs/sidebar";

const sidebarSections = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs/quickstart", label: "Quickstart", icon: <BoltIcon className="h-4 w-4" /> },
      { href: "/docs/api#authentication", label: "Authentication", icon: <KeyIcon className="h-4 w-4" /> },
      { href: "/docs/api#making-requests", label: "Making Requests", icon: <CodeIcon className="h-4 w-4" /> },
      { href: "/docs/api#errors", label: "Error Handling", icon: <AlertIcon className="h-4 w-4" /> },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/docs/api#files", label: "Files", icon: <FileIcon className="h-4 w-4" /> },
      { href: "/docs/api#folders", label: "Folders", icon: <FolderIcon className="h-4 w-4" /> },
      { href: "/docs/api#projects", label: "Projects", icon: <GridIcon className="h-4 w-4" /> },
      { href: "/docs/api#versions", label: "Versions", icon: <HistoryIcon className="h-4 w-4" /> },
      { href: "/docs/api#share", label: "Share", icon: <ShareIcon className="h-4 w-4" /> },
    ],
  },
];

const listFilesExample = `curl -X GET https://usemarkstore.com/api/v1/files \\
  -H "Authorization: Bearer msk_..." \\
  -H "Accept: application/json"`;

const responseExample = `{
  "files": [
    {
      "id": "file_abc123",
      "name": "document.md",
      "type": "md",
      "folder_id": "folder_xyz",
      "folder_name": "Files",
      "size": 1234,
      "created_at": "2025-05-01T12:34:56Z",
      "updated_at": "2025-05-02T10:00:00Z"
    }
  ]
}`;

const nodeExample = `const token = 'msk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const res = await fetch('https://usemarkstore.com/api/v1/files', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Accept': 'application/json',
  }
});

const data = await res.json();
console.log(data);`;

export default function QuickstartPage() {
  return (
    <div className="flex">
      <DocsSidebar sections={sidebarSections} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#1D7BFF]">
            MarkStore Docs
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Quickstart</h1>
          <p className="mt-4 text-lg text-slate-400">
            Get up and running with MarkStore in just a few minutes. Create an account, generate
            your API key, and start making requests.
          </p>

          <div className="mt-12 space-y-12">
            <section className="grid gap-8 lg:grid-cols-3">
              <Step number={1} title="Create account">
                <p className="text-sm text-slate-400">
                  Sign up for a MarkStore account at{" "}
                  <Link
                    href="/signup"
                    className="text-[#1D7BFF] hover:underline"
                  >
                    usemarkstore.com/signup
                  </Link>
                  . It only takes a minute.
                </p>
                <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <span># Visit the signup page</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    https://usemarkstore.com/signup
                  </p>
                </div>
              </Step>

              <Step number={2} title="Create API key in Settings">
                <p className="text-sm text-slate-400">
                  Go to{" "}
                  <Link href="/app/settings" className="text-[#1D7BFF] hover:underline">
                    Settings
                  </Link>{" "}
                  in your dashboard and create a new API key. Keep it safe — you&apos;ll need it for
                  API requests.
                </p>
                <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/40 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                      Settings
                    </span>
                    <ArrowIcon className="h-3 w-3 text-slate-600" />
                    <span className="rounded bg-[#1D7BFF]/20 px-2 py-0.5 text-xs font-medium text-blue-200">
                      + Create API Key
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Your key will look something like:</p>
                  <code className="mt-1 block text-sm text-slate-400">msk_************************</code>
                </div>
              </Step>

              <Step number={3} title="List files with curl">
                <p className="text-sm text-slate-400">
                  Use your API key in the Authorization header to make authenticated requests.
                </p>
              </Step>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Make your first request</h2>
              <p className="mt-2 text-sm text-slate-400">
                Use curl to list your files. Replace <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">msk_...</code> with your actual API key.
              </p>
              <div className="mt-4">
                <CodeBlock code={listFilesExample} language="bash" filename="bash" />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Example response</h2>
              <p className="mt-2 text-sm text-slate-400">
                A successful request returns your files as JSON.
              </p>
              <div className="mt-4">
                <CodeBlock code={responseExample} language="json" />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Quick Example (Node.js)</h2>
              <p className="mt-2 text-sm text-slate-400">
                Using the fetch API with a Bearer token.
              </p>
              <div className="mt-4">
                <CodeBlock code={nodeExample} language="javascript" filename="javascript" />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6">
              <h2 className="text-lg font-semibold">What&apos;s next?</h2>
              <p className="mt-2 text-sm text-slate-400">
                Now that you&apos;ve made your first request, explore the full API reference to learn
                about all available endpoints.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/docs/api"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D7BFF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  View API Reference
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs/api#files"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Files endpoints
                </Link>
                <Link
                  href="/docs/api#projects"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  Projects endpoints
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1D7BFF] text-sm font-bold text-white">
          {number}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
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

function CodeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14" />
    </svg>
  );
}

function AlertIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
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

function HistoryIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12a8 8 0 1 0 2.3-5.7" />
      <path d="M4 4v5h5M12 8v5l3 2" />
    </svg>
  );
}

function ShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}
