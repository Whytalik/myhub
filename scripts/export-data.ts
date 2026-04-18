import { PrismaClient } from "../src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting data export...");

  const data: any = {};

  // List of all models to export based on schema.prisma
  const models = [
    "user",
    "profile",
    "person",
    "product",
    "dish",
    "dishIngredient",
    "dayTemplate",
    "dayTemplateEntry",
    "weekPlan",
    "dayPlan",
    "dayPlanEntry",
    "shoppingList",
    "shoppingListItem",
    "lifeSphere",
    "task",
    "dailyEntry",
    "habit",
    "habitCompletion",
    "libraryItem",
    "wishlistItem",
    "language",
    "userLanguage",
    "languageSphereProgress",
    "vocabularyItem",
    "immersionLog",
    "languageResource",
  ];

  for (const model of models) {
    console.log(`📦 Exporting ${model}...`);
    // @ts-ignore - dynamic access to prisma models
    const records = await prisma[model].findMany();
    
    // Remove passwordHash from User for security
    if (model === "user") {
      records.forEach((r: any) => delete r.passwordHash);
    }
    
    data[model] = records;
  }

  const outputPath = path.join(process.cwd(), "prisma", "export.json");
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✅ Export completed! Data saved to ${outputPath}`);
  console.log(`📊 Total records exported: ${Object.values(data).flat().length}`);
}

main()
  .catch((e) => {
    console.error("❌ Export failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
