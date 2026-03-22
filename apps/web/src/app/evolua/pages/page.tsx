import Link from "next/link";

import { getAllPages } from "@/evolua/store";
import type { EvoluaPage } from "@/evolua/types";

export default async function EvoluaPagesIndexPage() {
  const pages = await getAllPages();

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">/evolua/pages</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Páginas do modelo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            Primeira área operacional do Evolu[a]. Aqui listamos as páginas conhecidas pelo modelo
            e abrimos o caminho para o editor semântico de cada uma.
          </p>
        </div>
        <Link
          href="/evolua"
          className="rounded-full border border-violet-200 bg-violet-50/60 px-4 py-2 text-sm font-medium text-violet-900 transition hover:bg-violet-100/70"
        >
          Voltar ao dashboard
        </Link>
      </div>

      <div className="grid gap-4">
        {pages.map((page: EvoluaPage) => (
          <article key={page.id} className="rounded-[24px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                  <span>{page.id}</span>
                  <span>•</span>
                  <span>{page.path}</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">{page.title}</h2>
                <p className="text-sm text-zinc-600">{page.nodes.length} node(s) semânticos nesta página.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={page.path}
                  className="rounded-full border border-violet-200 bg-violet-50/60 px-4 py-2 text-sm font-medium text-violet-900 transition hover:bg-violet-100/70"
                >
                  Abrir página
                </Link>
                <Link
                  href={`/evolua/pages/${encodeURIComponent(page.id)}`}
                  className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium !text-white transition hover:bg-violet-700"
                >
                  Operar página
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
