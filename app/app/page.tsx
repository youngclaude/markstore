import Link from "next/link";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { DocIcon, FolderIcon, JsonIcon, PlusIcon } from "@/components/icons";
import {
  DEFAULT_FOLDER_NAME,
  ensureDefaultFolder,
  formatBytes,
  formatModified,
  listFilesInFolder,
} from "@/lib/db";
import { resolveAuthSecret } from "@/lib/auth-secret";

export default async function AppPage() {
  resolveAuthSecret();
  const session = await auth();
  const email = session?.user?.email ?? "unknown";
  const userId = session!.user!.id;

  const folder = await ensureDefaultFolder(userId);
  const files = await listFilesInFolder(userId, folder.id);

  return (
    <AppShell email={email} activeFolder={DEFAULT_FOLDER_NAME}>
      <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
            <FolderIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{DEFAULT_FOLDER_NAME}</h1>
            <p className="text-sm text-slate-500">Personal files for this workspace.</p>
          </div>
        </div>
        <Link
          href="/app/files/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
        >
          <PlusIcon className="h-4 w-4" />
          Create
        </Link>
      </header>

      <section className="flex-1 px-6 py-5">
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/40">
          <div className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_180px] gap-2 border-b border-slate-800/80 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>Name</span>
            <span>Type</span>
            <span>Size</span>
            <span>Modified</span>
          </div>

          {files.length === 0 ? (
            <div className="px-4 py-16 text-center">
              <p className="text-sm text-slate-400">No files yet in {DEFAULT_FOLDER_NAME}.</p>
              <Link
                href="/app/files/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
              >
                <PlusIcon />
                Create your first file
              </Link>
            </div>
          ) : (
            <ul>
              {files.map((file) => (
                <li key={file.id}>
                  <Link
                    href={`/app/files/${file.id}`}
                    className="grid grid-cols-[minmax(0,1.6fr)_100px_100px_180px] gap-2 border-b border-slate-800/50 px-4 py-3 text-sm transition hover:bg-slate-900/60"
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate font-medium text-slate-100">
                      {file.type === "md" ? (
                        <DocIcon className="h-4 w-4 shrink-0 text-[#7BB6FF]" />
                      ) : (
                        <JsonIcon className="h-4 w-4 shrink-0 text-cyan-300" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </span>
                    <span>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                          file.type === "md"
                            ? "bg-violet-500/15 text-violet-300"
                            : "bg-teal-500/15 text-teal-300"
                        }`}
                      >
                        {file.type === "md" ? "Markdown" : "JSON"}
                      </span>
                    </span>
                    <span className="text-slate-400">{formatBytes(file.size)}</span>
                    <span className="text-slate-400">{formatModified(file.updated_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AppShell>
  );
}
