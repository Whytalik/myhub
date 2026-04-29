import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.POSTGRES_PRISMA_URL || 
         process.env.DATABASE_URL || 
         (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:6543/${process.env.POSTGRES_DATABASE}?pgbouncer=true` : "postgresql://unused:unused@localhost:5432/unused"),
    directUrl: process.env.POSTGRES_URL_NON_POOLING || 
               process.env.DIRECT_URL ||
               (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}` : undefined),
  },
});
