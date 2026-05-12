import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "hanmaster05@gmail.com" }
  });

  if (!user) {
    console.error("User Vitalii not found. Run seed-user first.");
    return;
  }

  const userId = user.id;

  // 1. Create Profiles
  const vitalii = await prisma.nutritionPerson.upsert({
    where: { id: "vitalii-profile" },
    update: {
      targetKcal: 1700,
      proteinPct: 45, // High protein as per plan
      fatPct: 30,
      carbsPct: 25,
      goal: "LOSE"
    },
    create: {
      id: "vitalii-profile",
      userId,
      name: "Vitalii",
      targetKcal: 1700,
      proteinPct: 45,
      fatPct: 30,
      carbsPct: 25,
      goal: "LOSE"
    }
  });

  const gf = await prisma.nutritionPerson.upsert({
    where: { id: "gf-profile" },
    update: {
      targetKcal: 2300,
      proteinPct: 15, // Approx for 80g protein at 2300kcal
      fatPct: 25,
      carbsPct: 60,
      goal: "GAIN"
    },
    create: {
      id: "gf-profile",
      userId,
      name: "GF",
      targetKcal: 2300,
      proteinPct: 15,
      fatPct: 25,
      carbsPct: 60,
      goal: "GAIN"
    }
  });

  // 2. Products
  const productsData = [
    { name: "Сир кисломолочний 0-2%", kcal: 80, p: 16, f: 0.5, c: 3, unit: "г", pkg: 250, cat: "Dairy" },
    { name: "Борошно пшеничне", kcal: 340, p: 10, f: 1, c: 70, unit: "г", pkg: 1000, cat: "Grocery" },
    { name: "Лаваш", kcal: 240, p: 8, f: 1, c: 48, unit: "г", pkg: 200, cat: "Bakery" },
    { name: "Куряче філе", kcal: 110, p: 23, f: 2, c: 0, unit: "г", pkg: 500, cat: "Meat" },
    { name: "Шоколад 85%", kcal: 580, p: 8, f: 45, c: 20, unit: "г", pkg: 100, cat: "Snacks" },
    { name: "Арахісова паста", kcal: 600, p: 25, f: 50, c: 15, unit: "г", pkg: 300, cat: "Snacks" },
    { name: "Йогурт густий", kcal: 60, p: 4, f: 3, c: 5, unit: "г", pkg: 300, cat: "Dairy" },
  ];

  const products: Record<string, any> = {};
  for (const p of productsData) {
    products[p.name] = await prisma.foodProduct.upsert({
      where: { id: p.name.replace(/\s+/g, '-').toLowerCase() },
      update: {},
      create: {
        id: p.name.replace(/\s+/g, '-').toLowerCase(),
        userId,
        name: p.name,
        caloriesPer100: p.kcal,
        proteinPer100: p.p,
        fatPer100: p.f,
        carbsPer100: p.c,
        fiberPer100: 0,
        unit: p.unit,
        standardPackageAmount: p.pkg,
        category: p.cat
      }
    });
  }

  // 3. Dishes
  const bagelDish = await prisma.dish.upsert({
    where: { id: "bagel-visual-plan" },
    update: {},
    create: {
      id: "bagel-visual-plan",
      userId,
      name: "Сирні Бейгли",
      servings: 4,
      ingredients: {
        create: [
          { productId: products["Сир кисломолочний 0-2%"].id, rawWeight: 250 },
          { productId: products["Борошно пшеничне"].id, rawWeight: 250 },
        ]
      }
    }
  });

  const kebabDish = await prisma.dish.upsert({
    where: { id: "kebab-visual-plan" },
    update: {},
    create: {
      id: "kebab-visual-plan",
      userId,
      name: "Кебаб Домашній",
      servings: 1,
      ingredients: {
        create: [
          { productId: products["Лаваш"].id, rawWeight: 100 },
          { productId: products["Куряче філе"].id, rawWeight: 150 },
          { productId: products["Йогурт густий"].id, rawWeight: 50 },
        ]
      }
    }
  });

  console.log("Visual plan data seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
