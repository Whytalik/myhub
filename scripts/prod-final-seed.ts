import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "../src/app/generated/prisma";

async function main() {
  const envPath = path.resolve(process.cwd(), ".env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split(/\r?\n/);
  const dbLine = lines.find(l => l.startsWith("POSTGRES_PRISMA_URL="));

  if (!dbLine) {
    console.error("❌ Could not find POSTGRES_PRISMA_URL line in .env.production.local");
    return;
  }

  const prodUrl = dbLine.split("=")[1].replace(/^"|"$/g, "");
  console.log("🔗 Connecting directly to Supabase...");

  const prisma = new PrismaClient({
    datasources: {
      db: { url: prodUrl },
    },
  });

  try {
    const user = await prisma.user.findFirst({ where: { email: "hanmaster05@gmail.com" } });
    if (!user) {
      console.error("❌ User hanmaster05@gmail.com not found in Production DB!");
      return;
    }
    const userId = user.id;
    console.log(`✅ Seeding for user: ${user.name} (${userId})`);

    // 1. PRODUCTS
    console.log("Seeding global products...");
    const productsData = [
      { name: "Сир кисломолочний 0-2%", kcal: 80, p: 16, f: 0.5, c: 3, fiber: 0, unit: "г", pkg: 250, cat: "Dairy" },
      { name: "Борошно пшеничне", kcal: 340, p: 10, f: 1, c: 70, fiber: 3, unit: "г", pkg: 1000, cat: "Grocery" },
      { name: "Лаваш", kcal: 240, p: 8, f: 1, c: 48, fiber: 2, unit: "г", pkg: 200, cat: "Bakery" },
      { name: "Куряче філе", kcal: 110, p: 23, f: 2, c: 0, fiber: 0, unit: "г", pkg: 500, cat: "Meat" },
      { name: "Йогурт густий (Грецький)", kcal: 60, p: 4, f: 3, c: 5, fiber: 0, unit: "г", pkg: 300, cat: "Dairy" },
      { name: "Шоколад 80-85%", kcal: 580, p: 8, f: 45, c: 20, fiber: 10, unit: "г", pkg: 100, cat: "Snacks" },
      { name: "Банан", kcal: 89, p: 1.1, f: 0.3, c: 22.8, fiber: 2.6, unit: "г", pkg: 1000, cat: "Fruits" },
    ];

    const globalProducts: Record<string, string> = {};
    for (const p of productsData) {
      const productId = `global-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
      const product = await prisma.foodProduct.upsert({
        where: { id: productId },
        update: { caloriesPer100: p.kcal, proteinPer100: p.p, fatPer100: p.f, carbsPer100: p.c, fiberPer100: p.fiber },
        create: {
          id: productId, userId: null, name: p.name, caloriesPer100: p.kcal, proteinPer100: p.p,
          fatPer100: p.f, carbsPer100: p.c, fiberPer100: p.fiber, unit: p.unit,
          standardPackageAmount: p.pkg, category: p.cat
        }
      });
      globalProducts[p.name] = product.id;
    }

    // 2. DISHES
    console.log("Seeding dishes...");
    const bagelId = `bagel-${userId}`;
    await prisma.dish.upsert({
      where: { id: bagelId },
      update: {},
      create: {
        id: bagelId, userId, name: "Сирні Бейгли", servings: 4, type: "MAIN",
        ingredients: {
          create: [
            { productId: globalProducts["Сир кисломолочний 0-2%"], rawWeight: 250 },
            { productId: globalProducts["Борошно пшеничне"], rawWeight: 250 },
          ]
        }
      }
    });

    const kebabId = `kebab-${userId}`;
    await prisma.dish.upsert({
      where: { id: kebabId },
      update: {},
      create: {
        id: kebabId, userId, name: "Кебаб Домашній", servings: 1, type: "MAIN",
        ingredients: {
          create: [
            { productId: globalProducts["Лаваш"], rawWeight: 100 },
            { productId: globalProducts["Куряче філе"], rawWeight: 150 },
            { productId: globalProducts["Йогурт густий (Грецький)"], rawWeight: 50 },
          ]
        }
      }
    });

    // 3. PROFILES
    console.log("Seeding profiles...");
    await prisma.nutritionPerson.upsert({
      where: { id: "vitalii-profile" },
      update: { targetKcal: 1700 },
      create: {
        id: "vitalii-profile", userId, name: "Vitalii", targetKcal: 1700,
        proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE"
      }
    });

    await prisma.nutritionPerson.upsert({
      where: { id: "gf-profile" },
      update: { targetKcal: 2300 },
      create: {
        id: "gf-profile", userId, name: "GF", targetKcal: 2300,
        proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN"
      }
    });

    // 4. WEEK PLAN
    console.log("Creating week plan...");
    const weekPlan = await prisma.weekPlan.create({
      data: {
        name: "Visual Plan Week", userId,
        dayPlans: {
          create: Array.from({ length: 7 }, (_, i) => ({
            userId, dayOfWeek: i,
            mealSlots: {
              create: [
                { personId: "vitalii-profile", name: "Сніданок", order: 1, targetKcal: 425, targetFiberGrams: 7 },
                { personId: "vitalii-profile", name: "Обід", order: 2, targetKcal: 680, targetFiberGrams: 13 },
                { personId: "gf-profile", name: "Сніданок", order: 1, targetKcal: 575, targetFiberGrams: 7 },
                { personId: "gf-profile", name: "Обід", order: 2, targetKcal: 920, targetFiberGrams: 13 },
              ]
            }
          }))
        }
      }
    });
    console.log(`✅ Plan created: ${weekPlan.id}`);
    console.log("🚀 ALL DONE!");

  } catch (e) {
    console.error("❌ Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
