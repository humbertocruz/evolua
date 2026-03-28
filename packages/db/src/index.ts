import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function createPrismaClient(): PrismaClient {
  if (global.__prisma) {
    return global.__prisma;
  }

  const client = new PrismaClient();
  global.__prisma = client;
  return client;
}

export { ensureDefaultProject } from "./store";
export type { User, Project, Page } from "@evolua/types";
