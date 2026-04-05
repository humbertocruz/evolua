"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addNodeToPageAction,
  updateNodeInPageAction,
  removeNodeFromPageAction,
  publishPageAction,
  unpublishPageAction,
} from "@/app/evolua/actions";
import type { EvoluaNode } from "@evolua/types";

type Props = {
  page: {
    id: string;
    title: string;
    path: string;
    status: string;
    nodes: EvoluaNode[];
  };
  projectId?: string;
};

const NODE_KINDS = [
  { value: "heading", label: "Título (h1)" },
  { value: "paragraph", label: "Parágrafo" },
  { value: "text", label: "Texto pequeno" },
  { value: "link", label: "Link" },
] as const;

function generateNodeId(kind: string): string {
  return `${kind}:${Date.now().toString(36)}`;
}

export function PageEditor({ page }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nodes, setNodes] = useState<EvoluaNode[]>(page.nodes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  function handlePublish() {
    startTransition(async () => {
      if (page.status === "published") {
        await unpublishPageAction(page.id);
      } else {
        await publishPageAction(page.id);
      }
      router.refresh();
    });
  }

  // ─── Add ──────────────────────────────────────────────────

  function handleAdd(formData: FormData) {
    const kind = String(formData.get("kind")) as EvoluaNode["kind"];
    const text = String(formData.get("text")).trim();
    const href = String(formData.get("href") || "").trim();

    if (!text) return;

    const newNode: EvoluaNode = {
      id: generateNodeId(kind),
      kind,
      text,
      ...(href ? { href } : {}),
    };

    startTransition(async () => {
      setNodes((prev) => [...prev, newNode]);
      setShowAddForm(false);
      await addNodeToPageAction(page.id, newNode);
    });
  }

  // ─── Update ───────────────────────────────────────────────

  function handleUpdate(nodeId: string, updates: Partial<Omit<EvoluaNode, "id">>) {
    startTransition(async () => {
      setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)));
      setEditingId(null);
      await updateNodeInPageAction(page.id, nodeId, updates);
    });
  }

  // ─── Remove ───────────────────────────────────────────────

  function handleRemove(nodeId: string) {
    if (!confirm("Remover este node?")) return;

    startTransition(async () => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      await removeNodeFromPageAction(page.id, nodeId);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* ─── Nodes List ─────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Nodes ({nodes.length})</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
          >
            + Adicionar node
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form
            action={handleAdd}
            className="rounded-2xl border border-violet-300 bg-violet-50 p-4 space-y-3"
          >
            <p className="text-sm font-medium text-violet-700">Novo node</p>
            <select
              name="kind"
              className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm"
              defaultValue="paragraph"
            >
              {NODE_KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
            <input
              name="text"
              placeholder="Texto do node..."
              className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm"
              autoFocus
            />
            <input
              name="href"
              placeholder="URL (só para link) — opcional"
              className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Nodes */}
        <div className="space-y-3">
          {nodes.length === 0 && (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
              Nenhum node ainda. Clique em "Adicionar node" acima.
            </p>
          )}
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              isEditing={editingId === node.id}
              isPending={isPending}
              onEdit={() => setEditingId(node.id)}
              onCancel={() => setEditingId(null)}
              onUpdate={handleUpdate}
              onRemove={() => handleRemove(node.id)}
            />
          ))}
        </div>
      </section>

      {/* ─── Page Meta ───────────────────────────────────── */}
      <aside className="space-y-6 rounded-[24px] border border-violet-100/80 bg-white p-6 shadow-[0_8px_24px_rgba(76,29,149,0.04)]">
        <div>
          <h2 className="text-xl font-semibold">Info da página</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Edite título, path e status da página.
          </p>
        </div>

        <PageMetaForm page={page} onSave={() => router.refresh()} />

        <button
          onClick={handlePublish}
          disabled={isPending}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-medium transition ${
            page.status === "published"
              ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {page.status === "published" ? "📝 Voltar para rascunho" : "🚀 Publicar página"}
        </button>

        <div className="space-y-3 rounded-2xl border border-dashed border-zinc-200 p-4 text-sm leading-6 text-zinc-600">
          <p className="font-medium text-zinc-800">Futuro:</p>
          <ul className="space-y-1">
            <li>• Editor visual por node (cores, estilos)</li>
            <li>• Conectar datasources</li>
            <li>• Actions e eventos</li>
            <li>• Publicar / despublicar</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

// ─── Node Card ───────────────────────────────────────────────

function NodeCard({
  node,
  isEditing,
  isPending,
  onEdit,
  onCancel,
  onUpdate,
  onRemove,
}: {
  node: EvoluaNode;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (id: string, updates: Partial<Omit<EvoluaNode, "id">>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-4 transition ${
        isPending ? "opacity-50" : ""
      } ${isEditing ? "border-violet-400 shadow-md" : "border-zinc-200"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono">{node.id}</span>
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-600">{node.kind}</span>
        </div>
        <span className={`text-xs ${node.href ? "text-blue-500" : "text-zinc-400"}`}>
          {node.href ? "🔗 link" : ""}
        </span>
      </div>

      {isEditing ? (
        <NodeEditForm node={node} onSave={onUpdate} onCancel={onCancel} />
      ) : (
        <>
          <p className="mt-2 text-base text-zinc-900">{node.text}</p>
          {node.href && (
            <p className="mt-1 text-sm text-blue-600">{node.href}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onEdit}
              className="rounded-lg border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50"
            >
              Editar
            </button>
            <button
              onClick={onRemove}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Remover
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function NodeEditForm({
  node,
  onSave,
  onCancel,
}: {
  node: EvoluaNode;
  onSave: (id: string, updates: Partial<Omit<EvoluaNode, "id">>) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave(node.id, {
          kind: fd.get("kind") as EvoluaNode["kind"],
          text: fd.get("text") as string,
          href: fd.get("href") as string || undefined,
        });
      }}
      className="mt-3 space-y-2"
    >
      <select
        name="kind"
        defaultValue={node.kind}
        className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm"
      >
        {NODE_KINDS.map((k) => (
          <option key={k.value} value={k.value}>{k.label}</option>
        ))}
      </select>
      <input
        name="text"
        defaultValue={node.text}
        className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm"
        autoFocus
      />
      <input
        name="href"
        defaultValue={node.href ?? ""}
        placeholder="URL (opcional)"
        className="w-full rounded-xl border border-violet-200 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-xs hover:bg-zinc-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Page Meta Form ─────────────────────────────────────────

function PageMetaForm({ page, onSave }: { page: { id: string; title: string; path: string; status: string }; onSave: () => void }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const title = String(formData.get("title") ?? "").trim();
      const path = String(formData.get("path") ?? "").trim();

      if (!title || !path) return;

      const { updatePageBasics } = await import("@/app/evolua/actions");
      await updatePageBasics(formData);
      onSave();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
        <input type="hidden" name="pageId" value={page.id} />
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-700">Título</span>
          <input
            name="title"
            defaultValue={page.title}
            className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-zinc-700">Path</span>
          <input
            name="path"
            defaultValue={page.path}
            className="w-full rounded-2xl border border-violet-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400"
          />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar página"}
        </button>
      </form>
  );
}
