"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  getUserProjects,
  createProject as storeCreateProject,
  getPageById,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
  addNodeToPage,
  updateNodeInPage,
  removeNodeFromPage,
} from "@/evolua/user-store";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

// ─── Projects ────────────────────────────────────────────────

export async function getProjectsAction() {
  const userId = await getUserId();
  return getUserProjects(userId);
}

export async function createProjectAction(formData: FormData) {
  const userId = await getUserId();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/\s+/g, "-");

  if (!name || !slug) throw new Error("Nome e slug são obrigatórios.");

  const project = await storeCreateProject(userId, name, slug);
  revalidatePath("/evolua");
  return project;
}

// ─── Page lifecycle ─────────────────────────────────────────

export async function createPageAction(projectId: string, title: string, path: string) {
  const userId = await getUserId();

  if (!projectId || !title || !path) throw new Error("Dados incompletos.");

  const { createPage } = await import("@/evolua/user-store");
  const page = await createPage(projectId, title, path);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");

  return page;
}

export async function updatePageBasics(formData: FormData) {
  const userId = await getUserId();
  const pageId = String(formData.get("pageId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const path = String(formData.get("path") ?? "").trim();

  if (!pageId || !title || !path.startsWith("/")) {
    throw new Error("Dados inválidos.");
  }

  await updatePage(pageId, userId, (page) => ({ ...page, title, path }));

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
  revalidatePath(path);
}

export async function deletePageAction(pageId: string) {
  const userId = await getUserId();
  await deletePage(pageId, userId);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
}

export async function publishPageAction(pageId: string) {
  const userId = await getUserId();
  await publishPage(pageId, userId);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

export async function unpublishPageAction(pageId: string) {
  const userId = await getUserId();
  await unpublishPage(pageId, userId);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

// ─── Nodes ─────────────────────────────────────────────────

export async function addNodeToPageAction(pageId: string, node: { id: string; kind: string; text: string; href?: string }) {
  const userId = await getUserId();
  await addNodeToPage(pageId, userId, node);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

export async function updateNodeInPageAction(
  pageId: string,
  nodeId: string,
  updates: Partial<{ text: string; href?: string; kind?: string }>
) {
  const userId = await getUserId();
  await updateNodeInPage(pageId, userId, nodeId, updates);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

export async function removeNodeFromPageAction(pageId: string, nodeId: string) {
  const userId = await getUserId();
  await removeNodeFromPage(pageId, userId, nodeId);

  revalidatePath("/evolua");
  revalidatePath("/evolua/pages");
  revalidatePath(`/evolua/pages/${encodeURIComponent(pageId)}`);
}

// ─── Getters (for server components) ──────────────────────

export async function getPageAction(pageId: string) {
  const userId = await getUserId();
  return getPageById(pageId, userId);
}
