import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

import { getPageById, getProjectById } from "@/evolua/user-store";
import type { EvoluaNode } from "@/evolua/types";
import { PageEditor } from "./page-editor";
import { DeployPanel } from "./deploy-panel";

export const dynamic = "force-dynamic";

export default async function EvoluaPageDetails({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { pageId } = await params;
  const page = await getPageById(decodeURIComponent(pageId), session.user.id);

  if (!page) {
    notFound();
  }

  const project = await getProjectById(page.projectId, session.user.id);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">Detalhe da página</p>
          <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-3 py-1">{page.id}</span>
            <span className="rounded-full bg-zinc-100 px-3 py-1">{page.path}</span>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">
              {page.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={page.path}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
          >
            Ver página no app
          </Link>
          <Link
            href="/evolua/pages"
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium !text-white transition hover:bg-zinc-800"
          >
            Voltar para páginas
          </Link>
        </div>
      </div>

      <PageEditor page={page} />

      {project && <DeployPanel page={page} project={project} />}
    </section>
  );
}
