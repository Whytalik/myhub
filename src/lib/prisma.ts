import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Programmatically enhance the connection string to handle Vercel/SSL issues
const getEnhancedConnectionString = () => {
  let url = process.env.DATABASE_URL || "";
  if (!url) return url;
  
  const hasParams = url.includes("?");
  // Fix SSL warning by being explicit
  if (!url.includes("sslmode=")) {
    url += (hasParams ? "&" : "?") + "sslmode=verify-full";
  }
  return url;
};

const pool = new pg.Pool({ 
  connectionString: getEnhancedConnectionString(),
  max: 1, // Crucial for Vercel: only 1 connection per lambda/worker
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

// Prisma client singleton
export const prisma = (() => {
  const p = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== "production") {
    // Check if new models are present (HMR safety)
    const isOutdated = p && !(p as any).wishlistItem;
    
    if (isOutdated) {
      const newP = new PrismaClient({ adapter });
      globalForPrisma.prisma = newP;
      return newP;
    }
    
    globalForPrisma.prisma = p;
  }
  
  return p;
})();
