import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { ProductCategory, ProductStatus, ProductSource, ProductState, Unit } from '../src/app/generated/prisma';

/**
 * Seed script for initial fruits.
 * Run with: npx tsx prisma/seed-fruits.ts
 */
async function main() {
  const fruits = [
    {
      name: 'Banana',
      category: 'FRUITS' as ProductCategory,
      calories: 89,
      protein: 1.1,
      fat: 0.3,
      carbs: 22.8,
      fiber: 2.6,
      status: 'ACTIVE' as ProductStatus,
      source: 'MANUAL' as ProductSource,
      state: 'RAW' as ProductState,
      unit: 'GRAM' as Unit,
    },
    {
      name: 'Apple',
      category: 'FRUITS' as ProductCategory,
      calories: 52,
      protein: 0.3,
      fat: 0.2,
      carbs: 13.8,
      fiber: 2.4,
      status: 'ACTIVE' as ProductStatus,
      source: 'MANUAL' as ProductSource,
      state: 'RAW' as ProductState,
      unit: 'GRAM' as Unit,
    },
    {
      name: 'Kiwi',
      category: 'FRUITS' as ProductCategory,
      calories: 61,
      protein: 1.1,
      fat: 0.5,
      carbs: 14.7,
      fiber: 3.0,
      status: 'ACTIVE' as ProductStatus,
      source: 'MANUAL' as ProductSource,
      state: 'RAW' as ProductState,
      unit: 'GRAM' as Unit,
    },
  ];

  console.log('🌱 Seeding fruits...');

  for (const fruit of fruits) {
    const existing = await prisma.product.findFirst({
      where: { name: fruit.name }
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: fruit,
      });
      console.log(`  ✅ Updated: ${fruit.name}`);
    } else {
      await prisma.product.create({
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
