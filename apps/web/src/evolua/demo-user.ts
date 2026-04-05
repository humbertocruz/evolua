import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@evolua.app";

export async function getOrCreateDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) return existing;

  const passwordHash = await bcrypt.hash("evolua123", 12);
  return prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo User",
      passwordHash,
    },
  });
}
