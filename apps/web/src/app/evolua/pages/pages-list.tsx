"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { EvoluaPage } from "@/packages/types";
import {
  createPageAction,
  deletePageAction,
  publishPageAction,
  unpublishPageAction,
} from "@/app/evolua/actions";

export function PagesList({ pages }: { pages: EvoluaPage[] }) {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-400">/evolua/pages</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Páginas do modelo</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            {pages.length} página(s) no modelo.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/evolua"
            className="rounded-full border border-violet-200 bg-violet-50/60 px-4 py-2 text-sm font-medium text-violet-900 transition hover:bg-violet-100/70"
          >
            Voltar ao dashboard
          </Link>
          <CreatePageButton />
        </div>
      </div>

      <div className="grid gap-4">
        {pages.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-zinc-300 bg-white p-12 text-center">
            <p className="text-zinc-500">Nenhuma página ainda.</p>
            <p className="mt-1 text-sm text-zinc-400">Crie a primeira acima.</p>
          </div>
        )}
        {pages.map((page: EvoluaPage) => (
          <PageRow key={page.id} page={page} />
        ))}
      </div>
    </section>
  );
}

// ─── Create ──────────────────────────────────────────────────

function CreatePageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const path = String(formData.get("path") ?? "").trim();

    if (!title || !path) return;

    startTransition(async () => {
      const page = await createPageAction(
        "default-project-id",
        String(formData.get("title") ?? "").trim(),
        String(formData.get("path") ?? "").trim()
      );
      setIsOpen(false);
      router.push(`/evolua/pages/${encodeURIComponent(page.id)}`);
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
      >
        + Nova página
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Criar nova página</h2>
            <p className="mt-2 text-sm text-zinc-600">
              A página começa como <strong>rascunho</strong>. Publique quando estiver pronta.
            </p>

            <form action={handleSubmit} className="mt-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-700">Título</span>
                <input
                  name="title"
                  placeholder="Ex: Página Inicial"
                  className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                  autoFocus
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-700">Path</span>
                <input
                  name="path"
                  placeholder="/home"
                  className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {isPending ? "Criando..." : "Criar página"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-zinc-300 px-4 py-3 text-sm hover:bg-zinc-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Row ─────────────────────────────────────────────────────

function PageRow({ page }: { page: EvoluaPage }) {
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
    if (!confirm(`Apagar página "${page.title}"? Esta ação não pode ser desfeita.`)) return;
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
              page.status === "published"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
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
              href={page.path}
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
            href={`/evolua/pages/${encodeURIComponent(page.id)}`}
            className="rounded-full border border-violet-200 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
          >
            📝 Editar
          </Link>
          <Link
            href={`/evolua/pages/${encodeURIComponent(page.id)}/visual`}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium !text-white transition hover:bg-zinc-800"
          >
            🎨 Visual
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
