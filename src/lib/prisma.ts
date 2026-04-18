import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Prisma client singleton with support for new models (Wishlist, Library)
// We use a getter to ensure we can "bust" the cache if a model is missing due to HMR
export const prisma = (() => {
  const p = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== "production") {
    // Check if new models are present, if not, force a new client instance
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
