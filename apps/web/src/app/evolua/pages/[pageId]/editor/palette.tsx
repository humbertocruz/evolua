"use client";

import { useEditor } from "./editor-context";
import { nodeKindList, type NodeKindLiteral } from "@/packages/types";

export function Palette() {
  const { addNode } = useEditor();

  return (
    <aside className="w-48 flex-shrink-0 space-y-1">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Elementos
      </p>

      {nodeKindList.map(({ kind, label, icon }) => (
        <button
          key={kind}
          onClick={() => addNode(kind as NodeKindLiteral)}
          className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
            {icon}
          </span>
          <span className="text-zinc-700">{label}</span>
        </button>
      ))}
    </aside>
  );
}
