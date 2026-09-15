import Link from "next/link";
import { CodeBlock } from "@/components/docs/code-block";
import { DocsSidebar } from "@/components/docs/sidebar";
import { EndpointBadge, EndpointList } from "@/components/docs/endpoint-badge";

const sidebarSections = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs/quickstart", label: "Quickstart", icon: <BoltIcon className="h-4 w-4" /> },
      { href: "/docs/api", label: "Authentication", icon: <KeyIcon className="h-4 w-4" /> },
      { href: "/docs/api#making-requests", label: "Making Requests", icon: <CodeIcon className="h-4 w-4" /> },
      { href: "/docs/api#errors", label: "Error Handling", icon: <AlertIcon className="h-4 w-4" /> },
      { href: "/docs/api#rate-limits", label: "Rate Limits", icon: <ClockIcon className="h-4 w-4" /> },
    ],
  },
  {
    title: "API Reference",
    items: [
      { href: "/docs/api#files", label: "Files", icon: <FileIcon className="h-4 w-4" /> },
      { href: "/docs/api#folders", label: "Folders", icon: <FolderIcon className="h-4 w-4" /> },
      { href: "/docs/api#projects", label: "Projects", icon: <GridIcon className="h-4 w-4" /> },
      { href: "/docs/api#versions", label: "Versions", icon: <HistoryIcon className="h-4 w-4" /> },
      { href: "/docs/api#share", label: "Share", icon: <ShareIcon className="h-4 w-4" /> },
    ],
  },
];

const authExample = `curl -X GET https://usemarkstore.com/api/v1/files \\
  -H "Authorization: Bearer msk_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -H "Accept: application/json"`;

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

const listFilesResponse = `{
  "files": [
    {
      "id": "file_abc123",
      "name": "document.md",
      "type": "md",
      "folder_id": "folder_xyz",
      "folder_name": "Documents",
      "size": 1234,
      "created_at": "2025-05-01T12:34:56Z",
      "updated_at": "2025-05-02T10:00:00Z"
    }
  ]
}`;

const createFileExample = `curl -X POST https://usemarkstore.com/api/v1/files \\
  -H "Authorization: Bearer msk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "notes.md",
    "type": "md",
    "content": "# My Notes\\n\\nHello, world!"
  }'`;

const createFileResponse = `{
  "ok": true,
  "file": {
    "id": "file_new123",
    "name": "notes.md",
    "type": "md",
    "folder_id": "folder_default",
    "folder_name": "Files",
    "size": 28,
    "created_at": "2025-05-03T14:00:00Z",
    "updated_at": "2025-05-03T14:00:00Z",
    "content": "# My Notes\\n\\nHello, world!"
  }
}`;

const getFileExample = `curl -X GET https://usemarkstore.com/api/v1/files/{id} \\
  -H "Authorization: Bearer msk_..."`;

const updateFileExample = `curl -X PATCH https://usemarkstore.com/api/v1/files/{id} \\
  -H "Authorization: Bearer msk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"content": "# Updated content", "name": "renamed.md"}'`;

const deleteFileExample = `curl -X DELETE https://usemarkstore.com/api/v1/files/{id} \\
  -H "Authorization: Bearer msk_..."`;

const listProjectFilesExample = `curl -X GET "https://usemarkstore.com/api/v1/files?project=my-project" \\
  -H "Authorization: Bearer msk_..."`;

const createProjectFileExample = `curl -X POST https://usemarkstore.com/api/v1/files \\
  -H "Authorization: Bearer msk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "readme.md",
    "type": "md",
    "content": "# Project README",
    "projectName": "my-project"
  }'`;

const errorResponse = `{
  "error": "Unauthorized — provide Authorization: Bearer msk_…"
}`;

export default function ApiReferencePage() {
  return (
    <div className="flex">
      <DocsSidebar sections={sidebarSections} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#1D7BFF]">
            API Reference
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Authentication</h1>
          <p className="mt-4 text-lg text-slate-400">
            MarkStore uses Bearer token authentication. Include your API token in the Authorization
            header with the Bearer scheme.
          </p>

          <div className="mt-8 rounded-xl border border-[#1D7BFF]/30 bg-[#1D7BFF]/10 p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1D7BFF]" />
              <div>
                <p className="font-medium text-blue-200">Your API Token</p>
                <p className="mt-1 text-sm text-slate-400">
                  You can find your personal API token in your{" "}
                  <Link href="/app/settings" className="text-[#1D7BFF] hover:underline">
                    account settings
                  </Link>
                  . Keep it safe and never expose it in client-side code.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Example Request</h2>
            <p className="mt-2 text-sm text-slate-400">
              Here&apos;s a sample cURL request showing how to authenticate with your token:
            </p>
            <div className="mt-4">
              <CodeBlock code={authExample} language="bash" filename="bash" />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Authentication Headers</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/60">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800/60 bg-slate-950/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Header</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  <tr>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">
                        Authorization
                      </code>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      Bearer token in the format: <code className="text-slate-300">Bearer msk_...</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-cyan-300">
                        Accept
                      </code>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      Set to <code className="text-slate-300">application/json</code> (recommended)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Quick Example (Node.js)</h2>
            <p className="mt-2 text-sm text-slate-400">
              Using the fetch API with a Bearer token.
            </p>
            <div className="mt-4">
              <CodeBlock code={nodeExample} language="javascript" filename="javascript" />
            </div>
          </section>

          <section id="making-requests" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Making Requests</h2>
            <p className="mt-4 text-slate-400">
              All API requests should be made to the base URL with the appropriate HTTP method.
            </p>
            <div className="mt-4 rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Base URL</p>
              <code className="mt-1 block text-lg text-[#1D7BFF]">https://usemarkstore.com</code>
            </div>
          </section>

          <section id="errors" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Error Handling</h2>
            <p className="mt-4 text-slate-400">
              The API returns standard HTTP status codes and JSON error responses.
            </p>
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/60">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800/60 bg-slate-950/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  <tr>
                    <td className="px-4 py-3 font-mono text-emerald-400">200</td>
                    <td className="px-4 py-3 text-slate-400">Success</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-emerald-400">201</td>
                    <td className="px-4 py-3 text-slate-400">Created</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-amber-400">400</td>
                    <td className="px-4 py-3 text-slate-400">Bad Request — invalid parameters</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-red-400">401</td>
                    <td className="px-4 py-3 text-slate-400">Unauthorized — missing or invalid token</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-red-400">404</td>
                    <td className="px-4 py-3 text-slate-400">Not Found — resource doesn&apos;t exist</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-amber-400">409</td>
                    <td className="px-4 py-3 text-slate-400">Conflict — resource already exists</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-red-400">500</td>
                    <td className="px-4 py-3 text-slate-400">Server Error</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm text-slate-400">Example error response:</p>
              <CodeBlock code={errorResponse} language="json" />
            </div>
          </section>

          <section id="rate-limits" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Rate Limits</h2>
            <p className="mt-4 text-slate-400">
              API requests are rate-limited to ensure fair usage. If you exceed the limit, you&apos;ll
              receive a 429 status code.
            </p>
          </section>

          <section id="files" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Files</h2>
            <p className="mt-4 text-slate-400">
              Endpoints for uploading, downloading, and managing files. Supports Markdown (.md) and
              JSON (.json) file types.
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold">Endpoints</h3>
              <div className="mt-4">
                <EndpointList>
                  <EndpointBadge method="GET" path="/api/v1/files" description="List and retrieve files" />
                  <EndpointBadge method="POST" path="/api/v1/files" description="Upload a file" />
                  <EndpointBadge method="GET" path="/api/v1/files/{id}" description="Get a specific file" />
                  <EndpointBadge method="PATCH" path="/api/v1/files/{id}" description="Update a file" />
                  <EndpointBadge method="DELETE" path="/api/v1/files/{id}" description="Delete a file" />
                </EndpointList>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">List Files</h3>
              <p className="mt-2 text-sm text-slate-400">
                Retrieve all files in your account. Optionally filter by folder or project.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/60">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800/60 bg-slate-950/60">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Parameter</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">folder</code>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">Filter by folder name (use &quot;all&quot; for all folders)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">project</code>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">Filter by project ID or name</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-400">Response:</p>
                <CodeBlock code={listFilesResponse} language="json" />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Create File</h3>
              <p className="mt-2 text-sm text-slate-400">
                Upload a new file. Supports Markdown and JSON content.
              </p>
              <div className="mt-4">
                <CodeBlock code={createFileExample} language="bash" filename="bash" />
              </div>
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800/60">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800/60 bg-slate-950/60">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Field</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-slate-300">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">name</code>
                        <span className="ml-1 text-red-400">*</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">Filename (auto-appends .md or .json)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">type</code>
                        <span className="ml-1 text-red-400">*</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">&quot;md&quot; or &quot;json&quot;</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">content</code>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">File content</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">folderName</code>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">Target folder name</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">projectId</code>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">Target project ID</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <code className="text-cyan-300">projectName</code>
                      </td>
                      <td className="px-4 py-3 text-slate-500">string</td>
                      <td className="px-4 py-3 text-slate-400">Target project name</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-sm text-slate-400">Response (201 Created):</p>
                <CodeBlock code={createFileResponse} language="json" />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Get File</h3>
              <p className="mt-2 text-sm text-slate-400">
                Retrieve a specific file by ID, including its content.
              </p>
              <div className="mt-4">
                <CodeBlock code={getFileExample} language="bash" filename="bash" />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Update File</h3>
              <p className="mt-2 text-sm text-slate-400">
                Update a file&apos;s content and/or name. Creates a new version.
              </p>
              <div className="mt-4">
                <CodeBlock code={updateFileExample} language="bash" filename="bash" />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">Delete File</h3>
              <p className="mt-2 text-sm text-slate-400">
                Permanently delete a file.
              </p>
              <div className="mt-4">
                <CodeBlock code={deleteFileExample} language="bash" filename="bash" />
              </div>
            </div>
          </section>

          <section id="folders" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Folders</h2>
            <p className="mt-4 text-slate-400">
              Organize your files with folders. Folders are created automatically when you upload
              files, or you can manage them through the web interface.
            </p>
            <div className="mt-6">
              <EndpointList>
                <EndpointBadge method="GET" path="/api/v1/files?folder={name}" description="List files in a folder" />
                <EndpointBadge method="GET" path="/api/v1/files?folder=all" description="List all files across folders" />
              </EndpointList>
            </div>
          </section>

          <section id="projects" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <p className="mt-4 text-slate-400">
              Group your content into projects for better organization. Projects have their own
              folder structure.
            </p>
            <div className="mt-6">
              <EndpointList>
                <EndpointBadge method="GET" path="/api/v1/files?project={id|name}" description="List project files" />
                <EndpointBadge method="POST" path="/api/v1/files" description="Create file in project" />
              </EndpointList>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">List Project Files</h3>
              <div className="mt-4">
                <CodeBlock code={listProjectFilesExample} language="bash" filename="bash" />
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Create File in Project</h3>
              <div className="mt-4">
                <CodeBlock code={createProjectFileExample} language="bash" filename="bash" />
              </div>
            </div>
          </section>

          <section id="versions" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Versions</h2>
            <p className="mt-4 text-slate-400">
              Every update to a file creates a new version. View version history and restore
              previous versions through the web interface.
            </p>
            <div className="mt-6">
              <EndpointList>
                <EndpointBadge method="GET" path="/api/files/{id}/versions" description="List file versions (web API)" />
                <EndpointBadge method="GET" path="/api/files/{id}/versions/{version}" description="Get specific version" />
              </EndpointList>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Note: Version endpoints use the web API authentication (session-based). For version
              history, access your files through the web interface.
            </p>
          </section>

          <section id="share" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-bold tracking-tight">Share</h2>
            <p className="mt-4 text-slate-400">
              Create public share links for your files. Anyone with the link can view the file
              content.
            </p>
            <div className="mt-6">
              <EndpointList>
                <EndpointBadge method="GET" path="/api/files/{id}/share" description="Get share status (web API)" />
                <EndpointBadge method="POST" path="/api/files/{id}/share" description="Enable sharing" />
                <EndpointBadge method="DELETE" path="/api/files/{id}/share" description="Revoke share link" />
              </EndpointList>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Note: Share endpoints use the web API authentication (session-based). Manage sharing
              through the file editor in the web interface.
            </p>
          </section>

          <section className="mt-16 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-6">
            <h2 className="text-lg font-semibold">Need Help?</h2>
            <p className="mt-2 text-sm text-slate-400">
              If you have questions or need support, check out our quickstart guide or reach out.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1D7BFF] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                View Quickstart
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Create an account
              </Link>
            </div>
          </section>
        </div>
      </div>

      <aside className="hidden w-64 shrink-0 border-l border-slate-800/60 xl:block">
        <div className="sticky top-0 h-screen overflow-y-auto px-4 py-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Endpoints
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            All endpoints require authentication using a Bearer token.
          </p>
          <nav className="mt-4 space-y-1.5 text-xs">
            <SidebarEndpoint method="GET" path="/api/v1/files" description="List and retrieve files" />
            <SidebarEndpoint method="POST" path="/api/v1/files" description="Upload a file" />
            <SidebarEndpoint method="GET" path="/api/v1/files/{id}" description="Get file by ID" />
            <SidebarEndpoint method="PATCH" path="/api/v1/files/{id}" description="Update file" />
            <SidebarEndpoint method="DELETE" path="/api/v1/files/{id}" description="Delete file" />
          </nav>
        </div>
      </aside>
    </div>
  );
}

function SidebarEndpoint({
  method,
  path,
  description,
}: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
}) {
  const methodColors = {
    GET: "bg-emerald-500/20 text-emerald-400",
    POST: "bg-blue-500/20 text-blue-400",
    PATCH: "bg-amber-500/20 text-amber-400",
    DELETE: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="flex items-start gap-2">
      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${methodColors[method]}`}>
        {method}
      </span>
      <div className="min-w-0">
        <code className="text-[11px] text-slate-300">{path}</code>
        <p className="mt-0.5 text-slate-500">{description}</p>
      </div>
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

function InfoIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
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

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
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
