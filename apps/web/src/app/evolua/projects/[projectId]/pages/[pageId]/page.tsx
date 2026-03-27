import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserProjects, getPageById } from "@/evolua/user-store";
import { PageEditor } from "../../pages/[pageId]/page-editor";

export const dynamic = "force-dynamic";

export default async function ProjectPageEditor({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { projectId, pageId } = await params;
  const projects = await getUserProjects(session.user.id);
  const project = projects.find((p) => p.id === projectId);

  if (!project) redirect("/evolua");

  const page = await getPageById(pageId, session.user.id);

  if (!page) redirect(`/evolua/projects/${projectId}/pages`);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Link href={`/evolua/projects/${projectId}/pages`} className="text-sm text-violet-500 hover:underline">← Voltar</Link>
          <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-3 py-1">{project.slug}</span>
            <span className="rounded-full bg-zinc-100 px-3 py-1">{page.path}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              page.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {page.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/app/${page.path}`}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
          >
            Ver página
          </Link>
          <Link
            href={`/evolua/projects/${projectId}/pages`}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium !text-white transition hover:bg-zinc-800"
          >
            Voltar
          </Link>
        </div>
      </div>

      <PageEditor page={page} projectId={projectId} />
    </section>
  );
}
