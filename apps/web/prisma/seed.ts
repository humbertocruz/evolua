import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

import seedModel from "../src/evolua/app.model.json";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const DEMO_PROJECT_SLUG = "default";
const DEMO_PROJECT_NAME = "Evolu[a] Next Host";
const DEMO_PATHS = new Set(["/", "/login", "/forgot-password"]);

function asInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function asNullableInputJson(value: unknown): Prisma.InputJsonValue | Prisma.NullTypes.DbNull {
  return value === undefined ? Prisma.DbNull : asInputJson(value);
}

async function main() {
  const project = await prisma.project.upsert({
    where: { slug: DEMO_PROJECT_SLUG },
    update: {
      name: DEMO_PROJECT_NAME,
      description: "Default Evolu[a] project bootstrapped from local seed model.",
    },
    create: {
      slug: DEMO_PROJECT_SLUG,
      name: DEMO_PROJECT_NAME,
      description: "Default Evolu[a] project bootstrapped from local seed model.",
    },
    select: { id: true, slug: true },
  });

  for (const page of seedModel.pages) {
    if (!DEMO_PATHS.has(page.path)) {
      continue;
    }

    await prisma.page.upsert({
      where: {
        projectId_path: {
          projectId: project.id,
          path: page.path,
        },
      },
      update: {
        title: page.title,
        status: "published",
        nodes: asInputJson(page.nodes),
        visual: asNullableInputJson(page.visual),
      },
      create: {
        projectId: project.id,
        path: page.path,
        title: page.title,
        status: "published",
        nodes: asInputJson(page.nodes),
        visual: asNullableInputJson(page.visual),
      },
    });
  }

  console.log(`Seeded project '${project.slug}' with runtime demo pages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
