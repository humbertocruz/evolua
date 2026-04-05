import { createPrismaClient, ensureDefaultProject } from "@evolua/db";

async function seed() {
  const prisma = createPrismaClient();

  await ensureDefaultProject(prisma, {
    slug: "my-first-project",
    name: "My First Project",
    description: "Welcome to Evolua!",
    apiKey: process.env.EVOLUA_API_KEY ?? "dev-api-key",
    ownerId: "default",
  });

  console.log("✅ Database seeded");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
