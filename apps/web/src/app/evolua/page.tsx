import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserProjects, getProjectPages } from "@/evolua/user-store";
import { CreateProjectButton } from "./create-project-button";

export default async function EvoluaHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const projects = await getUserProjects(session.user.id!);

  return (
    <section className="flex flex-col gap-6">
      <header className="rounded-[30px] border border-violet-100/80 bg-white px-6 py-7 shadow-[0_8px_30px_rgba(76,29,149,0.04)] lg:px-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-violet-400">/evolua</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
              Olá, {session.user.name ?? session.user.email}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {projects.length} projeto(s) no seu workspace.
            </p>
          </div>
          <CreateProjectButton />
        </div>
      </header>

      {/* Projects */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {projects.length === 0 && (
          <div className="col-span-full rounded-[24px] border border-dashed border-zinc-300 bg-white p-12 text-center">
            <p className="text-zinc-500">Nenhum projeto ainda.</p>
            <p className="mt-1 text-sm text-zinc-400">Crie seu primeiro projeto acima.</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Pages",
            description: "Editar páginas, nodes e publicar.",
            href: projects[0] ? `/evolua/projects/${projects[0].id}/pages` : null,
            stat: projects[0] ? `${projects[0].pageCount} páginas` : "—",
          },
          {
            title: "Components",
            description: "Blocos reutilizáveis do modelo.",
            href: "/evolua/components",
            stat: "em breve",
          },
          {
            title: "Datasources",
            description: "Conectar APIs e dados.",
            href: "/evolua/datasources",
            stat: "em breve",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href ?? "#"}
            className={`rounded-[26px] border border-violet-100/80 bg-white p-5 shadow-[0_8px_24px_rgba(76,29,149,0.04)] transition ${
              item.href ? "hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(76,29,149,0.08)]" : "opacity-60 pointer-events-none"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-400">{item.stat}</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-zinc-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function ProjectCard({ project }: { project: { id: string; name: string; slug: string; description?: string | null; pageCount: number; apiKey: string } }) {
  return (
    <Link
      href={`/evolua/projects/${project.id}/pages`}
      className="group rounded-[26px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(76,29,149,0.08)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">{project.name}</h2>
          <p className="mt-1 text-xs text-zinc-400">/{project.slug}</p>
        </div>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
          {project.pageCount} p.
        </span>
      </div>
      {project.description && (
        <p className="mt-3 text-sm text-zinc-600 line-clamp-2">{project.description}</p>
      )}
      <div className="mt-4 rounded-xl bg-zinc-100 p-2 text-xs font-mono text-zinc-500 truncate">
        {project.apiKey}
      </div>
      <p className="mt-2 text-xs text-violet-600 opacity-0 transition group-hover:opacity-100">
        Gerenciar →
      </p>
    </Link>
  );
}
