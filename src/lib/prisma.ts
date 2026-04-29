import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Application uses Supabase Pooler (6543) for runtime queries
const fixRuntimeUrl = (url: string | undefined) => {
  if (!url) return url;
  let fixed = url;
  if (!fixed.includes('sslmode=')) {
    const separator = fixed.includes('?') ? '&' : '?';
    fixed = `${fixed}${separator}sslmode=no-verify&schema=public`;
  }
  if (!fixed.includes('pgbouncer=true') && fixed.includes(':6543')) {
    const separator = fixed.includes('?') ? '&' : '?';
    fixed = `${fixed}${separator}pgbouncer=true`;
  }
  return fixed;
};

const rawUrl = process.env.POSTGRES_PRISMA_URL || 
              process.env.DATABASE_URL || 
              (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}` : undefined);

const runtimeUrl = fixRuntimeUrl(rawUrl);

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
  
  // Fallback to default configuration from prisma.config.ts
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
})();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
