import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import seedModel from "../src/evolua/app.model.json";

async function main() {
  // Create demo user
  const passwordHash = await bcrypt.hash("evolua123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@evolua.app" },
    update: {},
    create: {
      email: "demo@evolua.app",
      name: "Demo User",
      passwordHash,
    },
  });

  console.log(`User: demo@evolua.app / evolua123`);

  // Create default project
  const project = await prisma.project.upsert({
    where: { ownerId_slug: { ownerId: user.id, slug: "default" } },
    update: {},
    create: {
      slug: "default",
      name: "Meu Projeto",
      description: "Projeto padrão do Evolu[a].",
      ownerId: user.id,
    },
  });

  console.log(`Project: ${project.slug}`);

  // Seed pages from app.model.json
  const DEMO_PATHS = new Set(["/", "/login", "/forgot-password"]);

  for (const page of seedModel.pages) {
    if (!DEMO_PATHS.has(page.path)) continue;

    await prisma.page.upsert({
      where: {
        projectId_path: {
          projectId: project.id,
          path: page.path,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        path: page.path,
        title: page.title,
        status: "published",
        nodes: page.nodes as unknown[],
        visual: page.visual ?? undefined,
      },
    });
  }

  console.log(`Seeded ${seedModel.pages.filter((p) => DEMO_PATHS.has(p.path)).length} pages.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
