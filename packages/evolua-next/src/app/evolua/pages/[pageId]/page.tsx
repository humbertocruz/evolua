import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePageBasics } from "@/app/evolua/actions";
import { getPageById } from "@/evolua/store";
import type { EvoluaNode } from "@/evolua/types";

export default async function EvoluaPageDetails({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const page = await getPageById(decodeURIComponent(pageId));

  if (!page) {
    notFound();
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">Detalhe da página</p>
          <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-3 py-1">{page.id}</span>
            <span className="rounded-full bg-zinc-100 px-3 py-1">{page.path}</span>
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

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[24px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
          <h2 className="text-xl font-semibold">Nodes da página</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Primeira visão operacional da estrutura semântica. O próximo passo pode ser editar isso por UI,
            sem cair no JSON cru como interface principal.
          </p>

          <div className="mt-6 space-y-4">
            {page.nodes.map((node: EvoluaNode) => (
              <article key={node.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>{node.id}</span>
                  <span>•</span>
                  <span>{node.kind}</span>
                  {node.href ? (
                    <>
                      <span>•</span>
                      <span>{node.href}</span>
                    </>
                  ) : null}
                </div>
                <p className="mt-3 text-base text-zinc-900">{node.text}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6 rounded-[24px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
          <div>
            <h2 className="text-xl font-semibold">Operações básicas</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Primeiro editor real do cockpit: já dá para alterar título e path da página e salvar no banco.
            </p>
          </div>

          <form action={updatePageBasics} className="space-y-4">
            <input type="hidden" name="pageId" value={page.id} />

            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">Título</span>
              <input
                name="title"
                defaultValue={page.title}
                className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-violet-400"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-zinc-700">Path</span>
              <input
                name="path"
                defaultValue={page.path}
                className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none ring-0 transition focus:border-violet-400"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              Salvar página
            </button>
          </form>

          <ul className="space-y-3 text-sm leading-6 text-zinc-700">
            <li><span className="text-violet-500">•</span> próximo: adicionar/remover/reordenar nodes semânticos</li>
            <li><span className="text-violet-500">•</span> próximo: editar visual por node sem depender de JSX manual</li>
            <li><span className="text-violet-500">•</span> próximo: conectar datasources e actions da página</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
