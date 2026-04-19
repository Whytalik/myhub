import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: pg.Pool | undefined;
};

// Programmatically enhance the connection string
const getEnhancedConnectionString = () => {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;
  
  const hasParams = url.includes("?");
  // Force connection limit and SSL
  if (!url.includes("connection_limit=")) {
    url += (hasParams ? "&" : "?") + "connection_limit=1";
  }
  if (!url.includes("sslmode=")) {
    url += "&sslmode=verify-full";
  }
  return url;
};

// Use a singleton for the pool
if (!globalForPrisma.pgPool) {
  globalForPrisma.pgPool = new pg.Pool({ 
    connectionString: getEnhancedConnectionString(),
    max: 1,
    idleTimeoutMillis: 1000, // Aggressively close idle connections
    connectionTimeoutMillis: 5000,
  });
}

const adapter = new PrismaPg(globalForPrisma.pgPool);

// Prisma client singleton
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
