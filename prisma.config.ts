import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const fixUrl = (url: string | undefined) => {
  if (!url) return url;
  if (url.includes('sslmode=')) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sslmode=no-verify&schema=public`;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // For CLI (db push, generate, migrate), we MUST use the direct port 5432 to avoid hangs.
    url: fixUrl(process.env.POSTGRES_URL_NON_POOLING || 
         process.env.DIRECT_URL || 
         (process.env.POSTGRES_HOST ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}` : "postgresql://unused:unused@localhost:5432/unused")),
  },
});
