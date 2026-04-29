import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Application uses Supabase Pooler (6543) for runtime queries
const fixRuntimeUrl = (url: string | undefined) => {
  if (!url) return url;
  let fixed = url;
  
  // Force sslmode=prefer for the native Prisma engine to skip certificate verification
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

// Prisma 7 client singleton
// We use the native engine with optimized connection strings
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  ...(runtimeUrl ? { datasourceUrl: runtimeUrl } : {}),
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
