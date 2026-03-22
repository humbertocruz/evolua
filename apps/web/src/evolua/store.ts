import seedModel from "@/evolua/app.model.json";
import { prisma } from "@/lib/prisma";

import type { EvoluaAppModel, EvoluaPage } from "@/evolua/types";

const DEFAULT_PROJECT_SLUG = "default";
const DEFAULT_PROJECT_NAME = "Evolu[a] Next Host";

function parseModel(model: unknown): EvoluaAppModel {
  return model as EvoluaAppModel;
}

export async function ensureDefaultProject() {
  const existing = await prisma.evoluaProject.findUnique({
    where: { slug: DEFAULT_PROJECT_SLUG },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return prisma.evoluaProject.create({
    data: {
      slug: DEFAULT_PROJECT_SLUG,
      name: DEFAULT_PROJECT_NAME,
      description: "Default Evolu[a] project bootstrapped from local seed model.",
      model: seedModel,
      versions: {
        create: {
          version: 1,
          note: "Initial seed imported from app.model.json",
          model: seedModel,
        },
      },
    },
    select: { id: true },
  });
}

export async function getDefaultProject() {
  await ensureDefaultProject();

  const project = await prisma.evoluaProject.findUnique({
    where: { slug: DEFAULT_PROJECT_SLUG },
  });

  if (!project) {
    throw new Error("Could not load default Evolu[a] project.");
  }

  return {
    ...project,
    model: parseModel(project.model),
  };
}

export async function getAppModel(): Promise<EvoluaAppModel> {
  const project = await getDefaultProject();
  return project.model;
}

export async function getAllPages(): Promise<EvoluaPage[]> {
  const model = await getAppModel();
  return model.pages;
}

export async function getPageById(pageId: string): Promise<EvoluaPage | null> {
  const pages = await getAllPages();
  return pages.find((page: EvoluaPage) => page.id === pageId) ?? null;
}

export async function getPageByPath(path: string): Promise<EvoluaPage | null> {
  const pages = await getAllPages();
  return pages.find((page: EvoluaPage) => page.path === path) ?? null;
}

export async function updatePageInModel(
  pageId: string,
  updater: (page: EvoluaPage) => EvoluaPage,
): Promise<EvoluaAppModel> {
  const project = await getDefaultProject();
  const model: EvoluaAppModel = project.model;
  const currentPage = model.pages.find((page: EvoluaPage) => page.id === pageId);

  if (!currentPage) {
    throw new Error(`Could not find page ${pageId}`);
  }

  const nextModel: EvoluaAppModel = {
    ...model,
    pages: model.pages.map((page: EvoluaPage) => (page.id === pageId ? updater(page) : page)),
  };

  await prisma.evoluaProject.update({
    where: { slug: DEFAULT_PROJECT_SLUG },
    data: {
      model: nextModel,
    },
  });

  const versionCount = await prisma.evoluaProjectVersion.count({
    where: { projectId: project.id },
  });

  await prisma.evoluaProjectVersion.create({
    data: {
      projectId: project.id,
      version: versionCount + 1,
      note: `Updated page ${pageId}`,
      model: nextModel,
    },
  });

  return nextModel;
}
