// Multi-tenant store — all operations scoped to a user's project
// Usage: await userScopedStore(session.user.id)

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "pk_";
  for (let i = 0; i < 32; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}
import type { PageStatus } from "@prisma/client";
import type { EvoluaAppModel, EvoluaPage, EvoluaPageStatus } from "@/evolua/types";

function normalizePath(path: string): string {
  if (!path) return "/";
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

function mapPageFromDb(page: {
  id: string;
  path: string;
  title: string;
  status: PageStatus;
  nodes: unknown;
  visual: unknown | null;
}): EvoluaPage {
  return {
    id: page.id,
    path: page.path,
    title: page.title,
    status: page.status,
    nodes: page.nodes as EvoluaPage["nodes"],
    visual: (page.visual as EvoluaPage["visual"]) ?? undefined,
  };
}

// ─── Projects ────────────────────────────────────────────────

export async function getUserProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      apiKey: true,
      createdAt: true,
      _count: { select: { pages: true } },
    },
  });

  return projects.map((p) => ({
    ...p,
    pageCount: p._count.pages,
  }));
}

export async function createProject(userId: string, name: string, slug: string) {
  const project = await prisma.project.create({
    data: {
      slug,
      name,
      apiKey: generateApiKey(),
      ownerId: userId,
    },
  });
  return project;
}

export async function getProjectByApiKey(apiKey: string) {
  return prisma.project.findUnique({
    where: { apiKey },
    include: { owner: { select: { id: true, email: true, name: true } } },
  });
}

export async function regenerateApiKey(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });
  if (!project) throw new Error("Project not found");

  return prisma.project.update({
    where: { id: projectId },
    data: { apiKey: generateApiKey() },
  });
}

export async function getProjectBySlug(userId: string, slug: string) {
  return prisma.project.findFirst({
    where: { slug, ownerId: userId },
  });
}

export async function getProjectById(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });
}

// ─── Pages ─────────────────────────────────────────────────

export async function getProjectPages(projectId: string): Promise<EvoluaPage[]> {
  const pages = await prisma.page.findMany({
    where: { projectId },
    orderBy: { path: "asc" },
  });
  return pages.map(mapPageFromDb);
}

export async function getPageById(pageId: string, userId: string): Promise<EvoluaPage | null> {
  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      project: { ownerId: userId },
    },
  });
  return page ? mapPageFromDb(page) : null;
}

export async function getPageByPath(projectId: string, path: string): Promise<EvoluaPage | null> {
  const page = await prisma.page.findFirst({
    where: {
      projectId,
      path: normalizePath(path),
      status: "published",
    },
  });
  return page ? mapPageFromDb(page) : null;
}

export async function createPage(projectId: string, title: string, path: string) {
  const page = await prisma.page.create({
    data: {
      projectId,
      title,
      path: normalizePath(path),
      status: "draft",
      nodes: [],
    },
  });
  return { id: page.id, path: page.path };
}

export async function updatePage(
  pageId: string,
  userId: string,
  updater: (page: EvoluaPage) => EvoluaPage
): Promise<void> {
  const page = await getPageById(pageId, userId);
  if (!page) throw new Error("Page not found");

  const next = updater(page);

  await prisma.page.update({
    where: { id: pageId },
    data: {
      path: normalizePath(next.path),
      title: next.title,
      status: next.status,
      nodes: next.nodes,
      visual: next.visual ?? undefined,
    },
  });
}

export async function deletePage(pageId: string, userId: string): Promise<void> {
  await prisma.page.delete({
    where: { id: pageId, project: { ownerId: userId } },
  });
}

export async function publishPage(pageId: string, userId: string): Promise<void> {
  await prisma.page.update({
    where: { id: pageId, project: { ownerId: userId } },
    data: { status: "published" },
  });
}

export async function unpublishPage(pageId: string, userId: string): Promise<void> {
  await prisma.page.update({
    where: { id: pageId, project: { ownerId: userId } },
    data: { status: "draft" },
  });
}

// ─── Node ops ────────────────────────────────────────────────

export async function addNodeToPage(
  pageId: string,
  userId: string,
  node: { id: string; kind: string; text: string; href?: string }
): Promise<void> {
  const page = await getPageById(pageId, userId);
  if (!page) throw new Error("Page not found");

  await prisma.page.update({
    where: { id: pageId },
    data: { nodes: [...page.nodes, node] },
  });
}

export async function updateNodeInPage(
  pageId: string,
  userId: string,
  nodeId: string,
  updates: Partial<{ text: string; href?: string; kind?: string }>
): Promise<void> {
  const page = await getPageById(pageId, userId);
  if (!page) throw new Error("Page not found");

  await prisma.page.update({
    where: { id: pageId },
    data: {
      nodes: page.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    },
  });
}

export async function removeNodeFromPage(
  pageId: string,
  userId: string,
  nodeId: string
): Promise<void> {
  const page = await getPageById(pageId, userId);
  if (!page) throw new Error("Page not found");

  await prisma.page.update({
    where: { id: pageId },
    data: { nodes: page.nodes.filter((n) => n.id !== nodeId) },
  });
}

// ─── Runtime API (public — no auth, uses project slug + API key) ─

export async function getRuntimePageByProjectSlug(projectSlug: string, path: string) {
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!project) return null;

  const page = await prisma.page.findFirst({
    where: {
      projectId: project.id,
      path: normalizePath(path),
      status: "published",
    },
    select: { id: true, path: true, title: true, nodes: true, visual: true },
  });

  if (!page) return { project, page: null };

  return {
    project,
    page: { id: page.id, path: page.path, title: page.title, nodes: page.nodes, visual: page.visual },
  };
}
