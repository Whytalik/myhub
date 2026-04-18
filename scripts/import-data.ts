import { PrismaClient } from "../src/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const inputPath = path.join(process.cwd(), "prisma", "export.json");
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  console.log("🚀 Starting enhanced data import...");

  // 1. Create a default user if none exists in the export or the DB
  let targetUser = await prisma.user.findFirst();
  if (!targetUser) {
    console.log("👤 Creating default user...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    targetUser = await prisma.user.create({
      data: {
        email: "vitalii@hub.local",
        name: "Vitalii",
        passwordHash,
      },
    });
  }

  // 2. Ensure user has a profile and person
  let targetProfile = await prisma.profile.findUnique({ where: { userId: targetUser.id } });
  if (!targetProfile) {
    console.log("📁 Creating default profile...");
    targetProfile = await prisma.profile.create({
      data: {
        name: `${targetUser.name}'s Profile`,
        userId: targetUser.id,
      },
    });
  }

  let targetPerson = await prisma.person.findFirst({ where: { profileId: targetProfile.id } });
  if (!targetPerson) {
    console.log("👨 Creating default person...");
    targetPerson = await prisma.person.create({
      data: {
        name: targetUser.name || "Vitalii",
        profileId: targetProfile.id,
      },
    });
  }

  const personId = targetPerson.id;
  console.log(`🎯 Using Person ID: ${personId} for unlinked records.`);

  // Import order to satisfy foreign key constraints
  const importOrder = [
    // NextAuth models usually stay empty unless we exported them
    "product",
    "lifeSphere", // Needs personId
    "dish",       // Has personId in original data? Actually, check if it was unlinked before. 
                  // In schema.prisma OLD it was: model Dish { personId String ... }
                  // So some already have it.
    "dishIngredient",
    "dayTemplate",
    "dayTemplateEntry",
    "weekPlan",
    "dayPlan",
    "dayPlanEntry",
    "shoppingList",
    "shoppingListItem",
    "task",           // Needs personId
    "dailyEntry",     // Needs personId
    "habit",          // Needs personId
    "habitCompletion",
    "libraryItem",    // Needs personId
    "wishlistItem",   // Needs personId
    "language",
    "userLanguage",
    "languageSphereProgress",
    "vocabularyItem",
    "immersionLog",
    "languageResource",
  ];

  const modelsNeedingPersonId = [
    "lifeSphere",
    "task",
    "dailyEntry",
    "habit",
    "libraryItem",
    "wishlistItem",
  ];

  for (const model of importOrder) {
    const records = data[model];
    if (!records || records.length === 0) continue;

    console.log(`📦 Importing ${records.length} records for ${model}...`);

    // Sort by depth if model is task to satisfy parentId constraints
    if (model === "task") {
      records.sort((a: any, b: any) => (a.depth || 0) - (b.depth || 0));
    }

    for (const record of records) {
      // Inject personId if needed
      if (modelsNeedingPersonId.includes(model)) {
        record.personId = personId;
      }
      
      // Special case for dailyEntry: update unique constraint
      // (Handled by upsert below)

      // In Food space, some records might have old personId that doesn't exist anymore
      if (["dish", "dayTemplate", "weekPlan", "dayPlan", "shoppingList", "userLanguage"].includes(model)) {
        record.personId = personId;
      }

      // @ts-ignore
      await prisma[model].upsert({
        where: { id: record.id },
        update: record,
        create: record,
      }).catch((err: Error) => {
        console.error(`❌ Error importing ${model} (${record.id}):`, err.message);
      });
    }
  }

  console.log("✅ Data import completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
