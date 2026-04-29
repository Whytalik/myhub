import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 client singleton
// We prioritize the pooler (6543) for runtime if available.
// In our prisma.config.ts, we've swapped them so 'url' is direct and 'directUrl' is pooler for CLI compatibility.
const runtimeUrl = process.env.POSTGRES_PRISMA_URL || 
                  process.env.DATABASE_URL || 
                  (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}?pgbouncer=true&sslmode=no-verify&schema=public` : undefined);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  ...(runtimeUrl ? { datasourceUrl: runtimeUrl } : {}),
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
