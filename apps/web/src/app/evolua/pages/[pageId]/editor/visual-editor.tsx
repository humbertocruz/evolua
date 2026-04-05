"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { EditorProvider, useEditor } from "./editor-context";
import { Canvas } from "./canvas";
import { CanvasPreview } from "./canvas-preview";
import { Palette } from "./palette";
import { PropertyPanel } from "./property-panel";
import type { EditorNode } from "./editor-context";

interface VisualEditorProps {
  pageId: string;
  initialNodes: EditorNode[];
  onSave: (nodes: EditorNode[]) => Promise<void>;
}

export function VisualEditor({ pageId, initialNodes, onSave }: VisualEditorProps) {
  return (
    <EditorProvider initialNodes={initialNodes}>
      <EditorUI pageId={pageId} onSave={onSave} />
    </EditorProvider>
  );
}

function EditorUI({ pageId, onSave }: { pageId: string; onSave: (nodes: EditorNode[]) => Promise<void> }) {
  const { nodes, undo, redo, canUndo, canRedo, snapshotHistory } = useEditor();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Auto-save with 2s debounce
  const triggerSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      startTransition(async () => {
        await onSave(nodes);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      });
    }, 2000);
  }, [nodes, onSave]);

  // Watch nodes for auto-save
  useEffect(() => {
    triggerSave();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Desfazer (⌘Z)"
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Refazer (⌘⇧Z)"
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
            >
              ↪
            </button>
          </div>

          <div className="h-4 w-px bg-zinc-200" />

          {/* Preview toggle */}
          <button
            onClick={() => setPreviewMode((p) => !p)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
              previewMode
                ? "bg-indigo-100 text-indigo-700"
                : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {previewMode ? "✏️ Editar" : "👁️ Preview"}
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          <p className="text-sm font-medium text-zinc-700">
            {nodes.length} elemento{nodes.length !== 1 ? "s" : ""}
          </p>

          {saved && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              ✅ Salvo
            </span>
          )}

          {isPending && !saved && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600">
              ⏳ Salvando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!previewMode && (
            <button
              onClick={triggerSave}
              disabled={isPending}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              💾 Salvar
            </button>
          )}
        </div>
      </div>

      {/* Editor / Preview layout */}
      <div className="flex gap-4">
        {/* Palette — only in edit mode */}
        {!previewMode && <Palette />}

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          {previewMode ? (
            <CanvasPreview />
          ) : (
            <Canvas />
          )}
        </div>

        {/* Property panel — only in edit mode */}
        {!previewMode && (
          <aside className="w-72 flex-shrink-0 space-y-3">
            <PropertyPanel />
          </aside>
        )}
      </div>
    </div>
  );
}
