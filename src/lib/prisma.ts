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
  
  // Use sslmode=prefer for broad compatibility
  if (fixed.includes('sslmode=')) {
    fixed = fixed.replace(/sslmode=[^&]*/, 'sslmode=prefer');
  } else {
    const separator = fixed.includes('?') ? '&' : '?';
    fixed = `${fixed}${separator}sslmode=prefer`;
  }
  
  // Add libpq compatibility for the pg driver
  if (!fixed.includes('uselibpqcompat=')) {
    fixed = `${fixed}&uselibpqcompat=true`;
  }
  
  // Add pgbouncer flag if using the pooler port
  if (!fixed.includes('pgbouncer=true') && fixed.includes(':6543')) {
    fixed = `${fixed}&pgbouncer=true`;
  }
  
  if (!fixed.includes('schema=')) {
    fixed = `${fixed}&schema=public`;
  }
  
  return fixed;
};

const rawUrl = process.env.POSTGRES_PRISMA_URL || 
              process.env.DATABASE_URL || 
              (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}` : undefined);

const runtimeUrl = fixRuntimeUrl(rawUrl);

// Prisma 7 client singleton using Driver Adapter
// This is required to dynamically provide the connection URL in Prisma 7 without type errors.
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
  
  // Fallback to default configuration from prisma.config.ts if no runtime URL is constructed
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
})();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
