import { Prisma, type PageStatus } from "@prisma/client";

import seedModel from "@/evolua/app.model.json";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoUser } from "./demo-user";

import type { EvoluaAppModel, EvoluaPage, EvoluaPageStatus } from "@/evolua/types";

const DEFAULT_PROJECT_SLUG = process.env.EVOLUA_PUBLIC_PROJECT_SLUG ?? "evolua-saas";
const DEFAULT_PROJECT_NAME = "Evolu[a] Next Host";

type SeedPage = {
  path: string;
  title: string;
  status?: EvoluaPageStatus;
  nodes: EvoluaPage["nodes"];
  visual?: EvoluaPage["visual"];
};

export function normalizePath(path: string): string {
  if (!path) return "/";
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

function buildSeedPages(): SeedPage[] {
  return seedModel.pages.map((page) => ({
    path: normalizePath(page.path),
    title: page.title,
    status: "published",
    nodes: page.nodes as unknown as EvoluaPage["nodes"],
    visual: page.visual as unknown as EvoluaPage["visual"] | undefined,
  }));
}

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function asNullableInputJson(value: unknown): Prisma.InputJsonValue | Prisma.NullTypes.DbNull {
  return value === undefined ? Prisma.DbNull : asInputJson(value);
}

function mapPageFromDb(page: {
  id: string;
  path: string;
  title: string;
  status: PageStatus;
  nodes: Prisma.JsonValue;
  visual: Prisma.JsonValue | null;
}): EvoluaPage {
  return {
    id: page.id,
    path: page.path,
    title: page.title,
    status: page.status,
    nodes: page.nodes as EvoluaPage["nodes"],
    visual: (page.visual as EvoluaPage["visual"] | null) ?? undefined,
  };
}

export async function ensureDefaultProject() {
  const project = await prisma.project.upsert({
    where: { slug: DEFAULT_PROJECT_SLUG },
    update: {},
    create: {
      slug: DEFAULT_PROJECT_SLUG,
      name: DEFAULT_PROJECT_NAME,
      description: "Default Evolu[a] project bootstrapped from local seed model.",
      apiKey: "pk_demo_" + Math.random().toString(36).slice(2, 18),
      ownerId: (await getOrCreateDemoUser()).id,
    },
    select: { id: true },
  });

  const existingPages = await prisma.page.count({
    where: { projectId: project.id },
  });

  if (existingPages === 0) {
    const seedPages = buildSeedPages();

    await prisma.page.createMany({
      data: seedPages.map((page) => ({
        projectId: project.id,
        path: page.path,
        title: page.title,
        status: page.status ?? "published",
        nodes: asInputJson(page.nodes),
        visual: asNullableInputJson(page.visual),
      })),
    });
  }

  return project;
}

export async function getDefaultProject() {
  await ensureDefaultProject();

  const project = await prisma.project.findFirst({
    where: { slug: DEFAULT_PROJECT_SLUG },
  });

  if (!project) {
    throw new Error("Could not load default Evolu[a] project.");
  }

  return project;
}

export async function getAppModel(): Promise<EvoluaAppModel> {
  const project = await getDefaultProject();
  const pages = await getAllPages();

  return {
    app: {
      id: `project:${project.id}`,
      name: project.slug,
      title: project.name,
    },
    pages,
  };
}

export async function getAllPages(): Promise<EvoluaPage[]> {
  const project = await getDefaultProject();

  const pages = await prisma.page.findMany({
    where: { projectId: project.id },
    orderBy: { path: "asc" },
  });

  return pages.map(mapPageFromDb);
}

export async function getPageById(pageId: string): Promise<EvoluaPage | null> {
  await ensureDefaultProject();

  const page = await prisma.page.findFirst({
    where: {
      id: pageId,
      project: { slug: DEFAULT_PROJECT_SLUG },
    },
  });

  return page ? mapPageFromDb(page) : null;
}

export async function getPageByPath(path: string, projectId?: string): Promise<EvoluaPage | null> {
  await ensureDefaultProject();

  const where: Parameters<typeof prisma.page.findFirst>[0]["where"] = {
    path: normalizePath(path),
    status: "published",
  };

  if (projectId) {
    where.projectId = projectId;
  } else {
    where.project = { slug: DEFAULT_PROJECT_SLUG };
  }

  const page = await prisma.page.findFirst({ where });

  return page ? mapPageFromDb(page) : null;
}

export async function updatePageInModel(
  pageId: string,
  updater: (page: EvoluaPage) => EvoluaPage,
): Promise<EvoluaAppModel> {
  const currentPage = await getPageById(pageId);

  if (!currentPage) {
    throw new Error(`Could not find page ${pageId}`);
  }

  const nextPage = updater(currentPage);
  const nextPath = normalizePath(nextPage.path);

  await prisma.page.update({
    where: { id: pageId },
    data: {
      path: nextPath,
      title: nextPage.title,
      status: nextPage.status,
      nodes: asInputJson(nextPage.nodes),
      visual: asNullableInputJson(nextPage.visual),
    },
  });

  return getAppModel();
}

export async function getRuntimePageByProjectSlugAndPath(projectSlug: string, path: string) {
  await ensureDefaultProject();

  const project = await prisma.project.findFirst({
    where: { slug: projectSlug },
    select: { id: true, slug: true, name: true },
  });

  if (!project) {
    return null;
  }

  const page = await prisma.page.findFirst({
    where: {
      projectId: project.id,
      path: normalizePath(path),
      status: "published",
    },
    select: {
      id: true,
      path: true,
      title: true,
      nodes: true,
      visual: true,
    },
  });

  if (!page) {
    return { project, page: null };
  }

  return {
    project,
    page: {
      id: page.id,
      path: page.path,
      title: page.title,
      nodes: page.nodes,
      visual: page.visual,
    },
  };
}

// ─── Create & Delete ────────────────────────────────────────

export async function createPage(
  title: string,
  path: string
): Promise<{ id: string; path: string }> {
  const project = await getDefaultProject();

  const page = await prisma.page.create({
    data: {
      projectId: project.id,
      title,
      path: normalizePath(path),
      status: "draft",
      nodes: asInputJson([]),
    },
  });

  return { id: page.id, path: page.path };
}

export async function deletePage(pageId: string): Promise<void> {
  await prisma.page.delete({ where: { id: pageId } });
}

export async function publishPage(pageId: string): Promise<void> {
  await prisma.page.update({
    where: { id: pageId },
    data: { status: "published" },
  });
}

export async function unpublishPage(pageId: string): Promise<void> {
  await prisma.page.update({
    where: { id: pageId },
    data: { status: "draft" },
  });
}
