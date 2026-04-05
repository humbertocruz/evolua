import { PrismaClient } from "@prisma/client";

export interface EnsureProjectOptions {
  slug: string;
  name: string;
  description?: string;
  apiKey: string;
  ownerId: string;
}

export async function ensureDefaultProject(
  prisma: PrismaClient,
  options: EnsureProjectOptions
) {
  const existing = await prisma.project.findUnique({
    where: { slug: options.slug },
  });

  if (existing) {
    return existing;
  }

  return prisma.project.create({
    data: {
      slug: options.slug,
      name: options.name,
      description: options.description ?? null,
      apiKey: options.apiKey,
      ownerId: options.ownerId,
    },
  });
}
