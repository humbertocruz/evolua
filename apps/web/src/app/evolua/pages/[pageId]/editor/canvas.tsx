"use client";

import { useState, useRef } from "react";
import { useEditor, canHaveChildren } from "./editor-context";
import type { EditorNode } from "./editor-context";
import type { NodeKindLiteral } from "@evolua/types";

export function Canvas() {
  const { nodes, selectedNodeId, selectNode, moveNode, removeNode, addNode } = useEditor();

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <p className="text-4xl">📭</p>
        <p className="mt-3 font-medium text-zinc-600">Canvas vazio</p>
        <p className="mt-1 text-sm text-zinc-400">
          Adicione elementos pela paleta ao lado →
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1" onDragOver={(e) => e.preventDefault()}>
      {nodes.map((node, index) => (
        <TreeNode
          key={node.id}
          node={node}
          index={index}
          depth={0}
          isSelected={selectedNodeId === node.id}
          totalSiblings={nodes.length}
          onSelect={() => selectNode(node.id)}
          onRemove={() => removeNode(node.id)}
          onMoveNode={moveNode}
          onAddInside={(kind) => addNode(kind, node.id)}
        />
      ))}
    </div>
  );
}

// ─── Drop indicator position ──────────────────────────────────
type DropPosition =
  | { kind: "inside"; parentId: string }
  | { kind: "before"; parentId: string | null; index: number }
  | { kind: "after"; parentId: string | null; index: number };

// ─── TreeNode ────────────────────────────────────────────────

function TreeNode({
  node,
  index,
  depth,
  isSelected,
  totalSiblings,
  onSelect,
  onRemove,
  onMoveNode,
  onAddInside,
}: {
  node: EditorNode;
  index: number;
  depth: number;
  isSelected: boolean;
  totalSiblings: number;
  onSelect: () => void;
  onRemove: () => void;
  onMoveNode: (nodeId: string, newParentId: string | null, insertIndex?: number) => void;
  onAddInside: (kind: NodeKindLiteral) => void;
}) {
  const { moveNode, removeNode, addNode, selectNode, selectedNodeId } = useEditor();

  const [dragOver, setDragOver] = useState<"top" | "middle" | "bottom" | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const hasChildren = node.children.length > 0;
  const isContainer = canHaveChildren(node.kind);

  // ─── Drag handlers ────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", node.id);
    e.dataTransfer.effectAllowed = "move";
    // Slight delay so the dragged element doesn't show as transparent
    setTimeout(() => {
      nodeRef.current?.setAttribute("draggable", "true");
    }, 0);
  }

  function handleDragEnd() {
    setDragOver(null);
  }

  function handleDragOver(e: React.DragEvent, position: "top" | "middle" | "bottom") {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOver(position);
  }

  function handleDragLeave() {
    setDragOver(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === node.id) {
      setDragOver(null);
      return;
    }

    if (dragOver === "middle" && isContainer) {
      // Drop inside a container
      moveNode(draggedId, node.id);
    } else if (dragOver === "top") {
      // Drop before this node (same parent level)
      moveNode(draggedId, node.parentId, index);
    } else if (dragOver === "bottom") {
      // Drop after this node (same parent level)
      moveNode(draggedId, node.parentId, index + 1);
    }

    setDragOver(null);
  }

  // ─── Add menu ────────────────────────────────────────────────

  function handleAddClick(e: React.MouseEvent) {
    e.stopPropagation();
    setShowAddMenu((v) => !v);
  }

  const borderColor =
    dragOver === "top"
      ? "border-t-indigo-400"
      : dragOver === "bottom"
      ? "border-b-indigo-400"
      : dragOver === "middle"
      ? "border-indigo-400"
      : isSelected
      ? "border-indigo-400"
      : "border-zinc-200";

  const bgColor =
    dragOver === "middle" && isContainer
      ? "bg-indigo-50"
      : isSelected
      ? "bg-indigo-50"
      : "bg-white";

  return (
    <div ref={nodeRef}>
      {/* Drop indicator — top */}
      <div
        className={`h-1 rounded-full transition-all ${
          dragOver === "top" ? "bg-indigo-400 h-2 mb-1" : "h-0"
        }`}
        onDragOver={(e) => handleDragOver(e, "top")}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Node card */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={onSelect}
        className={`group relative cursor-grab rounded-2xl border-2 transition-all active:cursor-grabbing ${borderColor} ${bgColor} ${
          isSelected ? "shadow-md ring-2 ring-indigo-200" : "hover:shadow-sm"
        }`}
        style={{ marginLeft: depth * 24 }}
        onDragOver={(e) => {
          if (!isContainer) {
            // For non-containers, only top/bottom matters
            const rect = nodeRef.current!.getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            const pos = e.clientY < mid ? "top" : "bottom";
            handleDragOver(e, pos);
          } else {
            // For containers, divide into 3 zones
            const rect = nodeRef.current!.getBoundingClientRect();
            const q1 = rect.top + rect.height * 0.25;
            const q2 = rect.top + rect.height * 0.75;
            const pos = e.clientY < q1 ? "top" : e.clientY < q2 ? "middle" : "bottom";
            handleDragOver(e, pos);
          }
        }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-1.5">
          {/* Drag handle icon */}
          <span className="cursor-grab text-zinc-300 hover:text-zinc-400 active:cursor-grabbing">
            ⋮⋮
          </span>

          {isContainer && (
            <span className="text-xs text-zinc-400 select-none">
              {hasChildren ? "⊟" : "⊞"}
            </span>
          )}

          <span className="text-xs font-medium text-zinc-400">
            {String(index + 1).padStart(2, "0")}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isSelected
                ? "bg-indigo-200 text-indigo-800"
                : "bg-indigo-100 text-indigo-600"
            }`}
          >
            {node.kind}
          </span>

          {/* Controls */}
          <div className="ml-auto flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            {isContainer && (
              <button
                onClick={handleAddClick}
                className="rounded p-1 text-indigo-400 hover:bg-indigo-100"
                title="Adicionar dentro"
              >
                +
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="rounded p-1 text-red-400 hover:bg-red-50"
              title="Remover"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add menu popup */}
        {showAddMenu && isContainer && (
          <div className="border-b border-zinc-100 bg-white px-3 py-2">
            <p className="mb-2 text-xs text-zinc-400">Adicionar dentro:</p>
            <div className="flex flex-wrap gap-1">
              {(["heading", "paragraph", "text", "image", "button", "divider", "spacer"] as NodeKindLiteral[]).map(
                (kind) => (
                  <button
                    key={kind}
                    onClick={(e) => {
                      e.stopPropagation();
                      addNode(kind, node.id);
                      setShowAddMenu(false);
                    }}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-600 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {kind}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="px-4 py-3">
          <NodePreview node={node} />
        </div>

        {/* Drop zone indicator — middle (inside container) */}
        {dragOver === "middle" && isContainer && (
          <div className="pointer-events-none mx-3 mb-2 rounded border-2 border-dashed border-indigo-400 bg-indigo-50 py-3 text-center text-xs text-indigo-500">
            Solte aqui dentro
          </div>
        )}
      </div>

      {/* Drop indicator — bottom */}
      <div
        className={`h-1 rounded-full transition-all ${
          dragOver === "bottom" ? "bg-indigo-400 h-2 mt-1" : "h-0"
        }`}
        onDragOver={(e) => handleDragOver(e, "bottom")}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      {/* Children */}
      {hasChildren && (
        <div className="mt-1 space-y-1">
          {node.children.map((child, childIndex) => (
            <TreeNode
              key={child.id}
              node={child}
              index={childIndex}
              depth={depth + 1}
              isSelected={selectedNodeId === child.id}
              totalSiblings={node.children.length}
              onSelect={() => selectNode(child.id)}
              onRemove={() => removeNode(child.id)}
              onMoveNode={moveNode}
              onAddInside={(kind) => addNode(kind, child.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Preview renderer ───────────────────────────────────────

function NodePreview({ node }: { node: EditorNode }) {
  const p = node.props;

  switch (node.kind) {
    case "heading": {
      const level = String(p.level ?? "h1");
      const text = String(p.text ?? "Título");
      const align = String(p.align ?? "left") as "left" | "center" | "right";
      const color = p.color as string | undefined;
      const style = { textAlign: align, color };
      if (level === "h1") return <h1 style={style} className="text-3xl font-bold">{text}</h1>;
      if (level === "h2") return <h2 style={style} className="text-2xl font-bold">{text}</h2>;
      if (level === "h3") return <h3 style={style} className="text-xl font-bold">{text}</h3>;
      if (level === "h4") return <h4 style={style} className="text-lg font-bold">{text}</h4>;
      if (level === "h5") return <h5 style={style} className="text-base font-bold">{text}</h5>;
      return <h6 style={style} className="text-sm font-bold">{text}</h6>;
    }

    case "paragraph": {
      const text = String(p.text ?? "Parágrafo");
      const align = String(p.align ?? "left") as "left" | "center" | "right";
      return <p style={{ textAlign: align }} className="text-base text-zinc-700">{text}</p>;
    }

    case "text": {
      const text = String(p.text ?? "");
      const size = String(p.size ?? "base");
      const weight = String(p.weight ?? "normal");
      const color = p.color as string | undefined;
      const sizeMap: Record<string, string> = {
        xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl", "2xl": "text-2xl",
      };
      const weightMap: Record<string, string> = {
        light: "font-light", normal: "font-normal", medium: "font-medium", bold: "font-bold",
      };
      return (
        <span className={`${sizeMap[size] ?? "text-base"} ${weightMap[weight] ?? ""}`} style={{ color }}>
          {text}
        </span>
      );
    }

    case "link": {
      const text = String(p.text ?? "Link");
      const href = String(p.href ?? "#");
      const underline = p.underline !== false;
      const color = p.color as string | undefined;
      return (
        <a href={href} target={String(p.target ?? "_self")} className={`text-blue-600 hover:underline ${underline ? "" : "no-underline"}`} style={{ color }}>
          {text}
        </a>
      );
    }

    case "image": {
      const src = String(p.src ?? "https://picsum.photos/800/400");
      const alt = String(p.alt ?? "");
      const rounded = String(p.rounded ?? "md");
      const shadow = p.shadow === true;
      const roundedMap: Record<string, string> = {
        none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full",
      };
      return (
        <div className={`overflow-hidden ${roundedMap[rounded] ?? "rounded-md"} ${shadow ? "shadow-md" : ""}`}>
          <img src={src} alt={alt} className="w-full object-cover" loading="lazy" />
        </div>
      );
    }

    case "button": {
      const text = String(p.text ?? "Botão");
      const variant = String(p.variant ?? "solid");
      const fullWidth = p.fullWidth === true;
      const variantClass: Record<string, string> = {
        solid: "bg-indigo-600 text-white hover:bg-indigo-700",
        outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
        ghost: "text-indigo-600 hover:bg-indigo-50",
        link: "text-blue-600 hover:underline",
      };
      return (
        <button className={`rounded-xl px-4 py-2 text-sm font-medium transition ${variantClass[variant] ?? ""} ${fullWidth ? "w-full" : ""}`}>
          {text}
        </button>
      );
    }

    case "divider": {
      const orientation = String(p.orientation ?? "horizontal");
      return orientation === "horizontal" ? (
        <hr className="border-zinc-300" />
      ) : (
        <div className="h-8 w-px bg-zinc-300" />
      );
    }

    case "spacer": {
      const size = String(p.size ?? "md");
      const direction = String(p.direction ?? "vertical");
      const sizeMap: Record<string, string> = {
        xs: "h-2", sm: "h-4", md: "h-6", lg: "h-10", xl: "h-16",
      };
      return (
        <div className={`${sizeMap[size] ?? "h-6"} ${direction === "horizontal" ? "w-4 inline-block" : ""}`} aria-hidden="true" />
      );
    }

    case "container": {
      const tag = String(p.tag ?? "div");
      const maxWidth = String(p.maxWidth ?? "lg");
      const padding = String(p.padding ?? "md");
      const bg = p.bg as string | undefined;
      const maxWidthMap: Record<string, string> = {
        none: "max-w-none", sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl", "2xl:": "max-w-2xl", full: "max-w-full",
      };
      const paddingMap: Record<string, string> = {
        none: "p-0", sm: "p-2", md: "p-4", lg: "p-6", xl: "p-8",
      };
      return (
        <div
          className={`${maxWidthMap[maxWidth] ?? "max-w-lg"} ${paddingMap[padding] ?? "p-4"}`}
          style={{ backgroundColor: bg }}
        >
          <div className="rounded border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-center text-sm text-zinc-400">
            &lt;{tag}&gt; {node.children.length > 0 ? `${node.children.length} filho(s)` : "vazio"}
          </div>
        </div>
      );
    }

    case "columns": {
      const count = parseInt(String(p.count ?? "3"), 10);
      const gap = String(p.gap ?? "md");
      const gapMap: Record<string, string> = {
        none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6",
      };
      return (
        <div className={`grid grid-cols-${count} ${gapMap[gap] ?? "gap-4"}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded border-2 border-dashed border-zinc-300 bg-zinc-50 py-4 text-center text-xs text-zinc-400">
              {node.children[i] ? `${node.children[i].kind}` : `Coluna ${i + 1}`}
            </div>
          ))}
        </div>
      );
    }

    case "list": {
      const ordered = p.ordered === true;
      const spacing = String(p.spacing ?? "normal");
      const spacingMap: Record<string, string> = {
        tight: "space-y-1", normal: "space-y-2", relaxed: "space-y-4",
      };
      const Tag = ordered ? "ol" : "ul";
      return (
        <Tag className={`${spacingMap[spacing] ?? "space-y-2"} pl-5`}>
          {node.children.length > 0
            ? node.children.map((c) => <li key={c.id} className="text-zinc-600">{String(c.props.text ?? c.kind)}</li>)
            : <><li>Item 1</li><li>Item 2</li><li>Item 3</li></>
          }
        </Tag>
      );
    }

    case "listItem": {
      const text = String(p.text ?? "Item");
      return <li className="text-zinc-600">{text}</li>;
    }

    case "card": {
      const shadow = p.shadow === true;
      const rounded = String(p.rounded ?? "md");
      const padding = String(p.padding ?? "md");
      const bg = p.bg as string | undefined;
      const roundedMap: Record<string, string> = {
        none: "rounded-none", sm: "rounded-sm", md: "rounded-lg", lg: "rounded-xl", xl: "rounded-2xl", full: "rounded-full",
      };
      const paddingMap: Record<string, string> = {
        none: "p-0", sm: "p-2", md: "p-4", lg: "p-6", xl: "p-8",
      };
      const childContent = node.children.length > 0
        ? node.children.map((c) => <div key={c.id} className="mb-2 last:mb-0"><NodePreview node={c} /></div>)
        : (
          <div className="rounded border-2 border-dashed border-zinc-200 bg-zinc-50 p-3 text-center text-xs text-zinc-400">
            Arraste ou clique + pra adicionar
          </div>
        );
      return (
        <div
          className={`overflow-hidden ${roundedMap[rounded] ?? ""} ${shadow ? "shadow-md" : "border border-zinc-200"} ${paddingMap[padding] ?? "p-4"}`}
          style={{ backgroundColor: bg }}
        >
          {childContent}
        </div>
      );
    }

    default:
      return (
        <div className="rounded bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
          [{node.kind}]
        </div>
      );
  }
}
