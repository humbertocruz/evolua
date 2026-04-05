"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import type { NodeKindLiteral } from "@/packages/types";

export interface EditorNode {
  id: string;
  kind: NodeKindLiteral;
  props: Record<string, unknown>;
  parentId: string | null;
  children: EditorNode[];
}

export const CONTAINER_KINDS: NodeKindLiteral[] = [
  "container",
  "columns",
  "list",
  "card",
];

export function canHaveChildren(kind: NodeKindLiteral): boolean {
  return CONTAINER_KINDS.includes(kind);
}

// ─── Context ────────────────────────────────────────────────

interface EditorState {
  nodes: EditorNode[];
  selectedNodeId: string | null;
}

interface EditorContextValue extends EditorState {
  selectNode: (id: string | null) => void;
  addNode: (kind: NodeKindLiteral, parentId?: string | null) => void;
  updateNodeProps: (id: string, props: Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  moveNode: (id: string, targetParentId: string | null, insertIndex?: number) => void;
  selectedNode: EditorNode | null;
  selectedNodePath: string[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Call before a user interaction to snapshot history (debounced automatically) */
  snapshotHistory: () => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

// ─── Tree helpers ───────────────────────────────────────────

function generateNodeId(kind: NodeKindLiteral): string {
  return `${kind}:${Date.now().toString(36)}`;
}

function getDefaultProps(kind: NodeKindLiteral): Record<string, unknown> {
  const defaults: Partial<Record<NodeKindLiteral, Record<string, unknown>>> = {
    heading: { text: "Novo título", level: "h1", align: "left" },
    paragraph: { text: "Novo parágrafo", align: "left" },
    text: { text: "Texto", size: "base", weight: "normal" },
    link: { text: "Clique aqui", href: "#", target: "_self", underline: true },
    image: { src: "https://picsum.photos/800/400", alt: "", objectFit: "cover", rounded: "md", shadow: false },
    button: { text: "Botão", variant: "solid", size: "md", align: "left", fullWidth: false },
    divider: { orientation: "horizontal", thickness: "thin" },
    spacer: { size: "md", direction: "vertical" },
    container: { tag: "div", maxWidth: "lg", padding: "md" },
    columns: { count: "3", gap: "md", collapseOn: "md", align: "top" },
    list: { ordered: false, spacing: "normal" },
    listItem: { text: "Item" },
    card: { padding: "md", shadow: false, rounded: "md" },
  };
  return defaults[kind] ?? {};
}

function cloneNodes(nodes: EditorNode[]): EditorNode[] {
  return nodes.map((n) => ({
    ...n,
    children: cloneNodes(n.children),
  }));
}

function findNode(nodes: EditorNode[], id: string): EditorNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

function getNodePath(nodes: EditorNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) return [...path, node.id];
    const found = getNodePath(node.children, targetId, [...path, node.id]);
    if (found) return found;
  }
  return null;
}

function removeNodeFromTree(nodes: EditorNode[], id: string): EditorNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNodeFromTree(n.children, id) }));
}

function addNodeToTree(
  nodes: EditorNode[],
  newNode: EditorNode,
  parentId: string | null,
  insertIndex?: number
): EditorNode[] {
  if (parentId === null) {
    if (insertIndex !== undefined) {
      const next = [...nodes];
      next.splice(insertIndex, 0, newNode);
      return next;
    }
    return [...nodes, newNode];
  }
  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = [...node.children];
      if (insertIndex !== undefined) {
        children.splice(insertIndex, 0, newNode);
      } else {
        children.push(newNode);
      }
      return { ...node, children };
    }
    return {
      ...node,
      children: addNodeToTree(node.children, newNode, parentId, insertIndex),
    };
  });
}

function moveNodeInTree(
  nodes: EditorNode[],
  nodeId: string,
  newParentId: string | null,
  insertIndex?: number
): EditorNode[] {
  let movedNode: EditorNode | null = null;
  function extract(nds: EditorNode[]): EditorNode[] {
    return nds
      .filter((n) => {
        if (n.id === nodeId) { movedNode = n; return false; }
        return true;
      })
      .map((n) => ({ ...n, children: extract(n.children) }));
  }
  const withoutMoved = extract(cloneNodes(nodes));
  if (!movedNode) return nodes;
  return addNodeToTree(withoutMoved, movedNode, newParentId, insertIndex);
}

function updatePropsInTree(
  nodes: EditorNode[],
  id: string,
  props: Record<string, unknown>
): EditorNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, props: { ...n.props, ...props } };
    return { ...n, children: updatePropsInTree(n.children, id, props) };
  });
}

// ─── Provider ───────────────────────────────────────────────

const MAX_HISTORY = 50;

export function EditorProvider({
  initialNodes,
  children,
}: {
  initialNodes?: EditorNode[];
  children: React.ReactNode;
}) {
  const [state, setState] = useState<EditorState>({
    nodes: initialNodes ?? [],
    selectedNodeId: null,
  });

  // History: array of snapshots, index points to current
  const historyRef = useRef<EditorNode[][]>([initialNodes ?? []]);
  const historyIndexRef = useRef(0);
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedNode = state.selectedNodeId
    ? findNode(state.nodes, state.selectedNodeId)
    : null;

  const selectedNodePath = state.selectedNodeId
    ? getNodePath(state.nodes, state.selectedNodeId) ?? []
    : [];

  // Push current state to history (debounced)
  const snapshotHistory = useCallback(() => {
    if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    snapshotTimerRef.current = setTimeout(() => {
      // Trim any redo states and push current
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      historyRef.current.push(cloneNodes(state.nodes));
      // Keep max 50
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      }
      historyIndexRef.current = historyRef.current.length - 1;
    }, 300);
  }, [state.nodes]);

  const selectNode = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedNodeId: id }));
  }, []);

  const addNode = useCallback((kind: NodeKindLiteral, parentId: string | null = null) => {
    const newNode: EditorNode = {
      id: generateNodeId(kind),
      kind,
      props: getDefaultProps(kind),
      parentId,
      children: [],
    };
    setState((s) => ({
      ...s,
      nodes: addNodeToTree(s.nodes, newNode, parentId),
      selectedNodeId: newNode.id,
    }));
    // Snapshot after add
    setTimeout(() => snapshotHistory(), 0);
  }, [snapshotHistory]);

  const updateNodeProps = useCallback((id: string, props: Record<string, unknown>) => {
    setState((s) => ({
      ...s,
      nodes: updatePropsInTree(s.nodes, id, props),
    }));
    snapshotHistory();
  }, [snapshotHistory]);

  const removeNode = useCallback((id: string) => {
    setState((s) => ({
      nodes: removeNodeFromTree(s.nodes, id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
    setTimeout(() => snapshotHistory(), 0);
  }, [snapshotHistory]);

  const moveNode = useCallback((
    id: string,
    newParentId: string | null,
    insertIndex?: number
  ) => {
    setState((s) => ({
      ...s,
      nodes: moveNodeInTree(s.nodes, id, newParentId, insertIndex),
    }));
    setTimeout(() => snapshotHistory(), 0);
  }, [snapshotHistory]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    setState((s) => ({ ...s, nodes: cloneNodes(snapshot) }));
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    setState((s) => ({ ...s, nodes: cloneNodes(snapshot) }));
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return (
    <EditorContext.Provider
      value={{
        nodes: state.nodes,
        selectedNodeId: state.selectedNodeId,
        selectNode,
        addNode,
        updateNodeProps,
        removeNode,
        moveNode,
        selectedNode,
        selectedNodePath,
        undo,
        redo,
        canUndo,
        canRedo,
        snapshotHistory,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
}
