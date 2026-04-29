import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // For CLI operations (generate, db push, migrations), always use DIRECT connection (5432)
    url: process.env.POSTGRES_URL_NON_POOLING || 
         process.env.DIRECT_URL || 
         (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}` : "postgresql://unused:unused@localhost:5432/unused"),
  },
});
