import bcrypt from "bcryptjs";
import { createPrismaClient } from "./index";

const SEED_EMAIL = "admin@evolua.app";
const SEED_PASSWORD = "evolua2026";
const SEED_NAME = "Admin";
const PROJECT_SLUG = "evolua-saas";
const PROJECT_NAME = "Evolu[a] SaaS";

async function seed() {
  const prisma = createPrismaClient();

  console.log("🌱 Starting seed...");

  // Create admin user
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {},
    create: {
      email: SEED_EMAIL,
      name: SEED_NAME,
      passwordHash,
    },
  });
  console.log(`✅ User: ${user.email}`);

  // Create SaaS project
  const project = await prisma.project.upsert({
    where: { slug: PROJECT_SLUG },
    update: {},
    create: {
      slug: PROJECT_SLUG,
      name: PROJECT_NAME,
      description: "Site público do Evolu[a] SaaS",
      apiKey: "pk_saas_" + Math.random().toString(36).slice(2, 18),
      ownerId: user.id,
    },
  });
  console.log(`✅ Project: ${project.slug}`);

  // Check if pages already exist
  const existingPages = await prisma.page.count({ where: { projectId: project.id } });
  if (existingPages > 0) {
    console.log(`⏭️  ${existingPages} pages already exist — skipping`);
    await prisma.$disconnect();
    return;
  }

  // Seed pages
  const pages = [
    {
      path: "/",
      title: "Evolu[a]",
      status: "published" as const,
      nodes: [
        { id: "kicker", kind: "text", text: "O futuro do desenvolvimento web" },
        { id: "title", kind: "heading", text: "Construa apps impressionantes com JSON." },
        {
          id: "subtitle",
          kind: "paragraph",
          text: "Evolu[a] é uma plataforma onde você modela apps como dados e distribui como código. Sem limites, sem vendor lock-in.",
        },
        { id: "cta-btn", kind: "button", text: "Começar agora →", href: "/auth/register" },
        { id: "demo-link", kind: "link", text: "Faça login", href: "/auth/login" },
      ],
      visual: {
        kicker: { tone: "muted" },
        title: { color: "#4f46e5" },
      },
    },
    {
      path: "/auth/register",
      title: "Criar conta",
      status: "published" as const,
      nodes: [
        { id: "title", kind: "heading", text: "Criar sua conta" },
        { id: "subtitle", kind: "paragraph", text: "Comece a modelar seu app em minutos." },
      ],
      visual: {},
    },
    {
      path: "/auth/login",
      title: "Entrar",
      status: "published" as const,
      nodes: [
        { id: "title", kind: "heading", text: "Bem-vindo de volta" },
        { id: "subtitle", kind: "paragraph", text: "Faça login para continuar." },
      ],
      visual: {},
    },
  ];

  for (const page of pages) {
    await prisma.page.create({
      data: {
        projectId: project.id,
        path: page.path,
        title: page.title,
        status: page.status,
        nodes: page.nodes as any,
        visual: page.visual as any,
      },
    });
    console.log(`  📄 Page: ${page.path}`);
  }

  console.log(`\n✅ Seed completo!`);
  console.log(`   Email: ${SEED_EMAIL}`);
  console.log(`   Senha: ${SEED_PASSWORD}`);
  console.log(`   Projeto: ${PROJECT_SLUG}`);

  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
