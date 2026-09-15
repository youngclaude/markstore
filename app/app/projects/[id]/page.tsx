import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { ProjectDetailClient } from "@/components/project-detail-client";
import { ChevronRightIcon, ProjectIcon } from "@/components/icons";
import { resolveAuthSecret } from "@/lib/auth-secret";
import {
  getProject,
  listProjectFiles,
  listProjectFolders,
} from "@/lib/projects";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ folder?: string }>;
}) {
  resolveAuthSecret();
  const session = await auth();
  const email = session?.user?.email ?? "unknown";
  const userId = session!.user!.id;

  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const activeFolderId = sp.folder;

  const project = await getProject(userId, id);
  if (!project) notFound();

  const folders = await listProjectFolders(userId, id);
  const files = await listProjectFiles(userId, id, activeFolderId);

  return (
    <AppShell email={email} activeFolder="__projects__">
      <header className="border-b border-slate-800/80 px-6 py-4">
        <nav className="mb-3 flex items-center gap-1 text-sm text-slate-400">
          <Link href="/app/projects" className="hover:text-slate-200">
            Projects
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="text-slate-200">{project.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
            <ProjectIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-slate-500">{project.description}</p>
            )}
          </div>
        </div>
      </header>

      <ProjectDetailClient
        projectId={id}
        projectName={project.name}
        folders={folders}
        files={files}
        activeFolderId={activeFolderId}
      />
    </AppShell>
  );
}
