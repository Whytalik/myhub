import { PrismaClient } from "../src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const languages = [
    { name: "English", code: "en", icon: "🇺🇸" },
    { name: "Spanish", code: "es", icon: "🇪🇸" },
    { name: "German", code: "de", icon: "🇩🇪" },
    { name: "French", code: "fr", icon: "🇫🇷" },
    { name: "Japanese", code: "ja", icon: "🇯🇵" },
    { name: "Polish", code: "pl", icon: "🇵🇱" },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: lang,
      create: lang,
    });
  }

  console.log("Languages seeded successfully with Ukrainian names!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
