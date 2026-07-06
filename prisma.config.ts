import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

const fixUrl = (url: string | undefined) => {
  if (!url) return url;
  let fixed = url;
  if (fixed.includes("sslmode=")) {
    fixed = fixed.replace(/sslmode=[^&]*/, "sslmode=prefer");
  } else {
    const separator = fixed.includes("?") ? "&" : "?";
    fixed = `${fixed}${separator}sslmode=prefer`;
  }
  if (!fixed.includes("uselibpqcompat=")) {
    fixed = `${fixed}&uselibpqcompat=true`;
  }
  if (!fixed.includes("schema=")) {
    fixed = `${fixed}&schema=public`;
  }
  return fixed;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: fixUrl(
      process.env.POSTGRES_URL_NON_POOLING ||
        process.env.DIRECT_URL ||
        process.env.DATABASE_URL ||
        (process.env.POSTGRES_HOST
          ? `postgres://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}`
          : "postgresql://unused:unused@localhost:5432/unused"),
    ),
  },
});
