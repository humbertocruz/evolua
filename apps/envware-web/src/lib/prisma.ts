import { PrismaClient } from "../../prisma/generated-client";
// Force reload
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Adiciona pgbouncer=true se não estiver presente na URL
  if (connectionString.includes("pooler") && !connectionString.includes("pgbouncer=true")) {
    const separator = connectionString.includes("?") ? "&" : "?";
    connectionString += `${separator}pgbouncer=true`;
  }

  const pool = new Pool({ 
    connectionString,
    max: 10, // Limita o número de conexões por instância
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;