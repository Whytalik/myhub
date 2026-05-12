import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting global visual plan seed...");

  // 1. Create Global Products (userId: null)
  const productsData = [
    { name: "Сир кисломолочний 0-2%", kcal: 80, p: 16, f: 0.5, c: 3, fiber: 0, unit: "г", pkg: 250, cat: "Dairy" },
    { name: "Борошно пшеничне", kcal: 340, p: 10, f: 1, c: 70, fiber: 3, unit: "г", pkg: 1000, cat: "Grocery" },
    { name: "Лаваш", kcal: 240, p: 8, f: 1, c: 48, fiber: 2, unit: "г", pkg: 200, cat: "Bakery" },
    { name: "Куряче філе", kcal: 110, p: 23, f: 2, c: 0, fiber: 0, unit: "г", pkg: 500, cat: "Meat" },
    { name: "Йогурт густий (Грецький)", kcal: 60, p: 4, f: 3, c: 5, fiber: 0, unit: "г", pkg: 300, cat: "Dairy" },
    { name: "Помідори чері", kcal: 18, p: 0.9, f: 0.2, c: 4, fiber: 1.2, unit: "г", pkg: 250, cat: "Vegetables" },
    { name: "Пекінська капуста", kcal: 16, p: 1.2, f: 0.2, c: 3.2, fiber: 1.2, unit: "г", pkg: 500, cat: "Vegetables" },
    { name: "Шоколад 80-85%", kcal: 580, p: 8, f: 45, c: 20, fiber: 10, unit: "г", pkg: 100, cat: "Snacks" },
    { name: "Горіхи (Мигдаль/Арахіс)", kcal: 600, p: 25, f: 50, c: 15, fiber: 9, unit: "г", pkg: 150, cat: "Snacks" },
    { name: "Арахісова паста", kcal: 600, p: 25, f: 50, c: 15, fiber: 6, unit: "г", pkg: 300, cat: "Snacks" },
    { name: "Банан", kcal: 89, p: 1.1, f: 0.3, c: 22.8, fiber: 2.6, unit: "г", pkg: 1000, cat: "Fruits" },
  ];

  const globalProducts: Record<string, string> = {};

  for (const p of productsData) {
    const productId = `global-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
    const product = await prisma.foodProduct.upsert({
      where: { id: productId },
      update: {
        caloriesPer100: p.kcal,
        proteinPer100: p.p,
        fatPer100: p.f,
        carbsPer100: p.c,
        fiberPer100: p.fiber,
        standardPackageAmount: p.pkg,
      },
      create: {
        id: productId,
        userId: null, // Global product
        name: p.name,
        caloriesPer100: p.kcal,
        proteinPer100: p.p,
        fatPer100: p.f,
        carbsPer100: p.c,
        fiberPer100: p.fiber,
        unit: p.unit,
        standardPackageAmount: p.pkg,
        category: p.cat,
      }
    });
    globalProducts[p.name] = product.id;
  }
  
  console.log("Global products seeded.");

  // 2. Iterate all users to create standard Dishes
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users. Seeding dishes for each...`);

  for (const user of users) {
    // Bagels
    const bagelId = `bagel-${user.id}`;
    await prisma.dish.upsert({
      where: { id: bagelId },
      update: {},
      create: {
        id: bagelId,
        userId: user.id,
        name: "Сирні Бейгли",
        servings: 4,
        type: "MAIN",
        ingredients: {
          create: [
            { productId: globalProducts["Сир кисломолочний 0-2%"], rawWeight: 250 },
            { productId: globalProducts["Борошно пшеничне"], rawWeight: 250 },
          ]
        }
      }
    });

    // Kebab
    const kebabId = `kebab-${user.id}`;
    await prisma.dish.upsert({
      where: { id: kebabId },
      update: {},
      create: {
        id: kebabId,
        userId: user.id,
        name: "Кебаб Домашній",
        servings: 1,
        type: "MAIN",
        ingredients: {
          create: [
            { productId: globalProducts["Лаваш"], rawWeight: 100 },
            { productId: globalProducts["Куряче філе"], rawWeight: 150 },
            { productId: globalProducts["Йогурт густий (Грецький)"], rawWeight: 50 },
            { productId: globalProducts["Помідори чері"], rawWeight: 50 },
            { productId: globalProducts["Пекінська капуста"], rawWeight: 50 },
          ]
        }
      }
    });

    // Chocolate Snack
    const chocSnackId = `choc-snack-${user.id}`;
    await prisma.dish.upsert({
      where: { id: chocSnackId },
      update: {},
      create: {
        id: chocSnackId,
        userId: user.id,
        name: "Шоколадний Снек",
        servings: 1,
        type: "SNACK",
        ingredients: {
          create: [
            { productId: globalProducts["Шоколад 80-85%"], rawWeight: 20 },
            { productId: globalProducts["Горіхи (Мигдаль/Арахіс)"], rawWeight: 20 },
          ]
        }
      }
    });

    // Peanut Butter Snack
    const pbSnackId = `pb-snack-${user.id}`;
    await prisma.dish.upsert({
      where: { id: pbSnackId },
      update: {},
      create: {
        id: pbSnackId,
        userId: user.id,
        name: "Снек з Арахісовою Пастою",
        servings: 1,
        type: "SNACK",
        ingredients: {
          create: [
            { productId: globalProducts["Арахісова паста"], rawWeight: 20 },
            { productId: globalProducts["Банан"], rawWeight: 100 },
          ]
        }
      }
    });
  }

  console.log("All global dishes seeded for all users.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
