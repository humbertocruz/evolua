"use server";

import { revalidatePath } from "next/cache";

import { updatePageInModel } from "@/evolua/store";
import type { EvoluaNode } from "@/evolua/types";

// ─── Página ────────────────────────────────────────────────

export async function updatePageBasics(formData: FormData) {
  const pageId = String(formData.get("pageId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const path = String(formData.get("path") ?? "").trim();

  if (!pageId || !title || !path.startsWith("/")) {
    throw new Error("Invalid page payload.");
  }

  await updatePageInModel(pageId, (page) => ({
    ...page,
    title,
    path,
  }));

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
  revalidatePath(path);
}

// ─── Nodes ─────────────────────────────────────────────────

export async function addNodeToPage(pageId: string, node: EvoluaNode) {
  await updatePageInModel(pageId, (page) => ({
    ...page,
    nodes: [...page.nodes, node],
  }));

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

export async function updateNodeInPage(
  pageId: string,
  nodeId: string,
  updates: Partial<Omit<EvoluaNode, "id">>
) {
  await updatePageInModel(pageId, (page) => ({
    ...page,
    nodes: page.nodes.map((n) =>
      n.id === nodeId ? { ...n, ...updates } : n
    ),
  }));

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

export async function removeNodeFromPage(pageId: string, nodeId: string) {
  await updatePageInModel(pageId, (page) => ({
    ...page,
    nodes: page.nodes.filter((n) => n.id !== nodeId),
  }));

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

export async function reorderNodes(pageId: string, nodeIds: string[]) {
  await updatePageInModel(pageId, (page) => {
    const nodeMap = Object.fromEntries(page.nodes.map((n) => [n.id, n]));
    const reordered = nodeIds.map((id) => nodeMap[id]).filter(Boolean);
    return { ...page, nodes: reordered };
  });

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}
