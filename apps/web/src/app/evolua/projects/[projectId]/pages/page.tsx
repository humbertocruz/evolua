import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserProjects, getProjectPages } from "@/evolua/user-store";
import { CreatePageButton } from "./create-page-button";
import { PagesList } from "./pages-list";

export default async function ProjectPagesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { projectId } = await params;
  const projects = await getUserProjects(session.user.id);
  const project = projects.find((p) => p.id === projectId);

  if (!project) redirect("/evolua");

  const pages = await getProjectPages(projectId);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)] md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/evolua" className="text-sm text-violet-500 hover:underline">← Voltar</Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">/{project.slug}</p>
        </div>
        <CreatePageButton projectId={projectId} />
      </div>

      <PagesList pages={pages} projectId={projectId} />
    </section>
  );
}
