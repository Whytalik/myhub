import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma client singleton
// Note: When using Supabase, ensure DATABASE_URL in .env uses the transaction mode port (6543) 
// and includes ?pgbouncer=true if using the connection pooler.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

