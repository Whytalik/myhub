import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Application uses Supabase Pooler (6543) for runtime queries
const runtimeUrl = process.env.POSTGRES_PRISMA_URL || 
                  process.env.DATABASE_URL || 
                  (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}?pgbouncer=true&sslmode=no-verify&schema=public` : undefined);

// Prisma 7 client singleton using Driver Adapter for runtime pooling
export const prisma = globalForPrisma.prisma ?? (() => {
  if (runtimeUrl) {
    const pool = new pg.Pool({ 
      connectionString: runtimeUrl,
      ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  
  // Fallback to default configuration from prisma.config.ts (Direct 5432)
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
})();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
