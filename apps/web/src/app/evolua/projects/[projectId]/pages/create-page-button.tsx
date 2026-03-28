"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPageAction } from "@/app/evolua/actions";

export function CreatePageButton({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const path = String(formData.get("path") ?? "").trim();

    if (!title || !path) return;

    startTransition(async () => {
      const page = await createPageAction(projectId, title, path);
      setIsOpen(false);
      router.push(`/evolua/projects/${projectId}/pages/${encodeURIComponent(page.id)}`);
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
            <h2 className="text-xl font-semibold">Criar página</h2>
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
