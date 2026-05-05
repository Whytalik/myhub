import { prisma } from '../src/lib/prisma';
import { MealSlot, Priority } from '../src/app/generated/prisma';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'hanmaster05@gmail.com' }
  });

  if (!user) {
    console.error('User not found. Please run seed-user.ts first.');
    return;
  }

  console.log(`🌱 Seeding skeleton templates for user: ${user.name}`);

  const placeholderDish = await prisma.dish.upsert({
    where: { id: 'skeleton-placeholder-dish' },
    create: {
      id: 'skeleton-placeholder-dish',
      userId: user.id,
      name: 'Placeholder',
      description: 'Placeholder dish for skeleton templates',
    },
    update: {},
  });

  const templates = [
    {
      name: '📈 Масонабір (Gain)',
      slots: ['BREAKFAST', 'SNACK', 'LUNCH', 'SNACK', 'DINNER', 'SNACK'] as MealSlot[]
    },
    {
      name: '⚖️ Підтримка (Main)',
      slots: ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as MealSlot[]
    },
    {
      name: '📉 Схуднення (Loss)',
      slots: ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as MealSlot[]
    }
  ];

  for (const t of templates) {
    await prisma.dayTemplate.upsert({
      where: { id: `skeleton-day-${t.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {
        entries: {
          deleteMany: {},
          create: t.slots.map(slot => ({
            mealSlot: slot,
            dishId: placeholderDish.id,
            servings: 1,
            priority: 'FLEXIBLE' as Priority
          }))
        }
      },
      create: {
        id: `skeleton-day-${t.name.toLowerCase().replace(/\s+/g, '-')}`,
        userId: user.id,
        name: t.name,
        entries: {
          create: t.slots.map(slot => ({
            mealSlot: slot,
            dishId: placeholderDish.id,
            servings: 1,
            priority: 'FLEXIBLE' as Priority
          }))
        }
      }
    });
    console.log(`  🚀 Template: ${t.name} (${t.slots.length} slots)`);
  }

  console.log('✨ Skeleton templates seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
