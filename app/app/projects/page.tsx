import Link from "next/link";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { NewProjectModal } from "@/components/new-project-modal";
import { ProjectCard } from "@/components/project-card";
import { GridIcon, PlusIcon } from "@/components/icons";
import { resolveAuthSecret } from "@/lib/auth-secret";
import { listProjects } from "@/lib/projects";
import { formatModified } from "@/lib/files-shared";

export default async function ProjectsPage() {
  resolveAuthSecret();
  const session = await auth();
  const email = session?.user?.email ?? "unknown";
  const userId = session!.user!.id;

  const projects = await listProjects(userId);

  return (
    <AppShell email={email} activeFolder="__projects__">
      <header className="flex items-center justify-between gap-4 border-b border-slate-800/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1D7BFF]/15 text-[#4F9DFF]">
            <GridIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-slate-500">Organize AI context by project.</p>
          </div>
        </div>
        <NewProjectModal>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#1D7BFF] to-cyan-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            New project
          </button>
        </NewProjectModal>
      </header>

      <section className="flex-1 px-6 py-5">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/60 text-slate-500">
              <GridIcon className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-100">No projects yet.</h2>
            <p className="mb-8 mt-2 max-w-md text-slate-400">
              Organize AI context by project.
            </p>
            <NewProjectModal>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1D7BFF] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:brightness-110"
              >
                <PlusIcon className="h-4 w-4" />
                New project
              </button>
            </NewProjectModal>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
                fileCount={project.file_count}
                folderCount={project.folder_count}
                updatedAt={project.updated_at}
              />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
