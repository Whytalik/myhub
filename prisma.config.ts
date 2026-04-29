import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // For CLI (db push, generate, migrate), we MUST use the direct port 5432 to avoid hangs.
    // We prioritize DIRECT_URL or construction from individual components with port 5432.
    url: process.env.POSTGRES_URL_NON_POOLING || 
         process.env.DIRECT_URL || 
         (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?sslmode=no-verify&schema=public` : "postgresql://unused:unused@localhost:5432/unused"),
  },
});
