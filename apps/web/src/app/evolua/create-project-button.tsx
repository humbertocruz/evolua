"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "./actions";

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-");

    if (!name || !slug) return;

    startTransition(async () => {
      await createProjectAction(formData);
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
      >
        + Novo projeto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">Criar projeto</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Cada projeto tem suas próprias páginas, componentes e dados.
            </p>

            <form action={handleSubmit} className="mt-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-700">Nome</span>
                <input
                  name="name"
                  placeholder="Meu App"
                  className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                  autoFocus
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-zinc-700">Slug (URL)</span>
                <input
                  name="slug"
                  placeholder="meu-app"
                  className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
                />
                <span className="text-xs text-zinc-400">Fica disponível em /app/{'{slug}'}</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
                >
                  {isPending ? "Criando..." : "Criar projeto"}
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
