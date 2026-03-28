import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import seedModel from "../src/evolua/app.model.json";

const SAAS_SLUG = "evolua-saas";
const DEMO_EMAIL = "demo@evolua.app";
const DEMO_PASSWORD = "evolua2026";

async function main() {
  // ── Demo user ────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: "Admin",
      passwordHash,
    },
  });
  console.log(`✅ User: ${user.email} / ${DEMO_PASSWORD}`);

  // ── SaaS public project ─────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { slug: SAAS_SLUG },
    update: {},
    create: {
      slug: SAAS_SLUG,
      name: "Evolu[a] SaaS",
      description: "Site público do Evolu[a] — modelo seedado do app.model.json",
      apiKey: "pk_saas_" + Math.random().toString(36).slice(2, 18),
      ownerId: user.id,
    },
  });
  console.log(`✅ Project: ${project.slug}`);

  // ── Pages from app.model.json ───────────────────────────────
  let seeded = 0;
  for (const page of seedModel.pages) {
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
        visual: (page.visual as unknown[]) ?? [],
      },
    });
    seeded++;
  }
  console.log(`✅ ${seeded} pages seeded from app.model.json`);

  console.log(`\n🚀 Seed completo!`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
