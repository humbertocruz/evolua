import { createPrismaClient, ensureDefaultProject } from "./index";

async function seed() {
  const prisma = createPrismaClient();

  // Create default project if it doesn't exist
  await ensureDefaultProject(prisma, {
    slug: "my-first-project",
    name: "My First Project",
    description: "Welcome to Evolua!",
    apiKey: process.env.EVOLUA_API_KEY ?? "dev-api-key",
    ownerId: "default",
  });

  console.log("✅ Database seeded successfully");
  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
