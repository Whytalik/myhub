import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Application uses Supabase Pooler (6543) for runtime queries
const fixRuntimeUrl = (url: string | undefined, isLocal: boolean) => {
  if (!url) return url;
  let fixed = url;
  
  // Use sslmode=disable for local, sslmode=prefer for remote
  const sslMode = isLocal ? 'disable' : 'prefer';
  if (fixed.includes('sslmode=')) {
    fixed = fixed.replace(/sslmode=[^&]*/, `sslmode=${sslMode}`);
  } else {
    const separator = fixed.includes('?') ? '&' : '?';
    fixed = `${fixed}${separator}sslmode=${sslMode}`;
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

const isLocal = rawUrl?.includes('localhost') || rawUrl?.includes('127.0.0.1') || false;

const runtimeUrl = fixRuntimeUrl(rawUrl, isLocal);

// Prisma 7 client singleton using Driver Adapter
// This is required to dynamically provide the connection URL in Prisma 7 without type errors.
export const prisma = globalForPrisma.prisma ?? (() => {
  if (runtimeUrl) {
    const pool = new pg.Pool({ 
      connectionString: runtimeUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  
  // Fallback to default configuration from prisma.config.ts if no runtime URL is constructed
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
})();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
