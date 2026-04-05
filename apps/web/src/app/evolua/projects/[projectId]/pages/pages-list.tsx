"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { EvoluaPage } from "@evolua/types";
import {
  deletePageAction,
  publishPageAction,
  unpublishPageAction,
} from "@/app/evolua/actions";

export function PagesList({ pages, projectId }: { pages: EvoluaPage[]; projectId: string }) {
  return (
    <div className="grid gap-4">
      {pages.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white p-12 text-center">
          <p className="text-zinc-500">Nenhuma página ainda.</p>
          <p className="mt-1 text-sm text-zinc-400">Crie a primeira acima.</p>
        </div>
      )}
      {pages.map((page: EvoluaPage) => (
        <PageRow key={page.id} page={page} projectId={projectId} />
      ))}
    </div>
  );
}

function PageRow({ page, projectId }: { page: EvoluaPage; projectId: string }) {
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      if (page.status === "published") {
        await unpublishPageAction(page.id);
      } else {
        await publishPageAction(page.id);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Apagar "${page.title}"? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await deletePageAction(page.id);
    });
  }

  return (
    <article className={`rounded-[24px] border bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)] transition ${isPending ? "opacity-50" : ""}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-500">{page.path}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              page.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {page.status === "published" ? "🟢 published" : "📝 draft"}
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{page.title}</h2>
          <p className="text-sm text-zinc-600">{page.nodes.length} node(s)</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {page.status === "published" ? (
            <Link
              href={`/app/${page.path}`}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50"
            >
              Abrir
            </Link>
          ) : (
            <span className="rounded-full border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-400">
              Não publicado
            </span>
          )}
          <button
            onClick={handlePublish}
            disabled={isPending}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              page.status === "published"
                ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            {page.status === "published" ? "Despublicar" : "Publicar"}
          </button>
          <Link
            href={`/evolua/projects/${projectId}/pages/${encodeURIComponent(page.id)}`}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium !text-white transition hover:bg-zinc-800"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            🗑️
          </button>
        </div>
      </div>
    </article>
  );
}
