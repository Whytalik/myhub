import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Application uses Supabase Pooler (6543) via Driver Adapter
const connectionString = process.env.POSTGRES_PRISMA_URL || 
                        process.env.DATABASE_URL || 
                        (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}?pgbouncer=true` : undefined);

// Prisma client singleton with Driver Adapter
export const prisma = globalForPrisma.prisma ?? (() => {
  if (connectionString) {
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  
  // Fallback to default (prisma.config.ts) if no connection string
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
})();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

