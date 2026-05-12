import { PrismaClient } from '../src/app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({ where: { email: "hanmaster05@gmail.com" } });
  if (!user) {
    console.error("❌ User hanmaster05@gmail.com not found!");
    return;
  }
  const userId = user.id;

  // 1. PRODUCTS
  console.log("Seeding products...");
  const productsData = [
    { name: "Сир кисломолочний 0-2%", kcal: 80, p: 16, f: 0.5, c: 3, unit: "г", pkg: 250, cat: "Dairy" },
    { name: "Борошно пшеничне", kcal: 340, p: 10, f: 1, c: 70, unit: "г", pkg: 1000, cat: "Grocery" },
    { name: "Лаваш", kcal: 240, p: 8, f: 1, c: 48, unit: "г", pkg: 200, cat: "Bakery" },
    { name: "Куряче філе", kcal: 110, p: 23, f: 2, c: 0, unit: "г", pkg: 500, cat: "Meat" },
    { name: "Шоколад 80-85%", kcal: 580, p: 8, f: 45, c: 20, unit: "г", pkg: 100, cat: "Snacks" },
  ];

  for (const p of productsData) {
    await prisma.foodProduct.upsert({
      where: { id: `global-${p.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `global-${p.name.replace(/\s+/g, '-').toLowerCase()}`,
        userId: null,
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

  // 2. PROFILES
  console.log("Seeding profiles...");
  await prisma.nutritionPerson.upsert({
    where: { id: "vitalii-profile" },
    update: {},
    create: { id: "vitalii-profile", userId, name: "Vitalii", targetKcal: 1700, proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE" }
  });

  await prisma.nutritionPerson.upsert({
    where: { id: "gf-profile" },
    update: {},
    create: { id: "gf-profile", userId, name: "GF", targetKcal: 2300, proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN" }
  });

  console.log("✅ PROD SEED SUCCESSFUL");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
