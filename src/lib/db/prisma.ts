import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const fixRuntimeUrl = (url: string | undefined, isLocal: boolean) => {
  if (!url) return url;
  let fixed = url;

  const sslMode = isLocal ? "disable" : "prefer";
  if (fixed.includes("sslmode=")) {
    fixed = fixed.replace(/sslmode=[^&]*/, `sslmode=${sslMode}`);
  } else {
    const separator = fixed.includes("?") ? "&" : "?";
    fixed = `${fixed}${separator}sslmode=${sslMode}`;
  }

  if (!fixed.includes("uselibpqcompat=")) {
    fixed = `${fixed}&uselibpqcompat=true`;
  }

  if (!fixed.includes("pgbouncer=true") && fixed.includes(":6543")) {
    fixed = `${fixed}&pgbouncer=true`;
  }

  if (!fixed.includes("schema=")) {
    fixed = `${fixed}&schema=public`;
  }

  return fixed;
};

const rawUrl =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL ||
  (process.env.POSTGRES_HOST
    ? `postgres://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}`
    : "postgresql://unused:unused@localhost:5432/unused");

const isLocal = rawUrl?.includes("localhost") || rawUrl?.includes("127.0.0.1") || false;

const runtimeUrl = fixRuntimeUrl(rawUrl, isLocal);

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (runtimeUrl) {
      const pool = new pg.Pool({
        connectionString: runtimeUrl,
        ssl: isLocal ? false : { rejectUnauthorized: false },
      });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
