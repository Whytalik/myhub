import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { ProductStatus } from '../src/app/generated/prisma';

async function main() {
  const fruits = [
    {
      name: 'Banana',
      category: 'FRUITS',
      caloriesPer100: 89,
      proteinPer100: 1.1,
      fatPer100: 0.3,
      carbsPer100: 22.8,
      fiberPer100: 2.6,
      status: 'ACTIVE' as ProductStatus,
      unit: 'GRAM',
      standardPackageAmount: 100,
    },
    {
      name: 'Apple',
      category: 'FRUITS',
      caloriesPer100: 52,
      proteinPer100: 0.3,
      fatPer100: 0.2,
      carbsPer100: 13.8,
      fiberPer100: 2.4,
      status: 'ACTIVE' as ProductStatus,
      unit: 'GRAM',
      standardPackageAmount: 100,
    },
    {
      name: 'Kiwi',
      category: 'FRUITS',
      caloriesPer100: 61,
      proteinPer100: 1.1,
      fatPer100: 0.5,
      carbsPer100: 14.7,
      fiberPer100: 3.0,
      status: 'ACTIVE' as ProductStatus,
      unit: 'GRAM',
      standardPackageAmount: 100,
    },
  ];

  console.log('🌱 Seeding fruits...');

  for (const fruit of fruits) {
    const existing = await prisma.foodProduct.findFirst({
      where: { name: fruit.name }
    });

    if (existing) {
      await prisma.foodProduct.update({
        where: { id: existing.id },
        data: fruit,
      });
      console.log(`  ✅ Updated: ${fruit.name}`);
    } else {
      await prisma.foodProduct.create({
        data: fruit,
      });
      console.log(`  ➕ Created: ${fruit.name}`);
    }
  }

  console.log('🚀 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
