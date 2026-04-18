import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { 
  ProductStatus, 
  ProductSource, 
  ProductState, 
  Unit, 
  ProductCategory 
} from '../src/app/generated/prisma';

/**
 * Comprehensive Seed Script for 80+ common food products in Ukrainian.
 * Ensures at least 5 products per each of the 15 categories.
 * Run with: npx tsx prisma/seed-all-products.ts
 */
async function main() {
  const products = [
    // 1. FRUITS (6)
    { name: 'Банан', category: 'FRUITS', calories: 89, protein: 1.1, fat: 0.3, carbs: 22.8, fiber: 2.6 },
    { name: 'Яблуко', category: 'FRUITS', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, fiber: 2.4 },
    { name: 'Ківі', category: 'FRUITS', calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7, fiber: 3.0 },
    { name: 'Апельсин', category: 'FRUITS', calories: 47, protein: 0.9, fat: 0.1, carbs: 11.7, fiber: 2.4 },
    { name: 'Груша', category: 'FRUITS', calories: 57, protein: 0.4, fat: 0.1, carbs: 15.0, fiber: 3.1 },
    { name: 'Персик', category: 'FRUITS', calories: 39, protein: 0.9, fat: 0.3, carbs: 9.5, fiber: 1.5 },

    // 2. VEGETABLES (6)
    { name: 'Броколі', category: 'VEGETABLES', calories: 34, protein: 2.8, fat: 0.4, carbs: 6.6, fiber: 2.6 },
    { name: 'Томат', category: 'VEGETABLES', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
    { name: 'Морква', category: 'VEGETABLES', calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, fiber: 2.8 },
    { name: 'Картопля', category: 'VEGETABLES', calories: 77, protein: 2.0, fat: 0.4, carbs: 17.0, fiber: 2.2 },
    { name: 'Огірок', category: 'VEGETABLES', calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5 },
    { name: 'Перець болгарський', category: 'VEGETABLES', calories: 26, protein: 1.0, fat: 0.3, carbs: 6.0, fiber: 2.1 },

    // 3. DAIRY (6)
    { name: 'Сир кисломолочний (9%)', category: 'DAIRY', calories: 157, protein: 16.0, fat: 9.0, carbs: 3.0, fiber: 0 },
    { name: 'Молоко (2.5%)', category: 'DAIRY', calories: 52, protein: 2.8, fat: 2.5, carbs: 4.7, fiber: 0 },
    { name: 'Кефір (2.5%)', category: 'DAIRY', calories: 50, protein: 3.0, fat: 2.5, carbs: 4.0, fiber: 0 },
    { name: 'Йогурт натуральний', category: 'DAIRY', calories: 50, protein: 4.0, fat: 1.5, carbs: 5.0, fiber: 0 },
    { name: 'Сир твердий (чеддер)', category: 'DAIRY', calories: 400, protein: 25.0, fat: 33.0, carbs: 1.3, fiber: 0 },
    { name: 'Сметана (20%)', category: 'DAIRY', calories: 204, protein: 2.5, fat: 20.0, carbs: 3.4, fiber: 0 },

    // 4. MEAT (5)
    { name: 'Свинина (вирізка)', category: 'MEAT', calories: 160, protein: 20.0, fat: 8.0, carbs: 0, fiber: 0 },
    { name: 'Яловичина (гуляш)', category: 'MEAT', calories: 150, protein: 19.0, fat: 8.0, carbs: 0, fiber: 0 },
    { name: 'Баранина', category: 'MEAT', calories: 230, protein: 17.0, fat: 18.0, carbs: 0, fiber: 0 },
    { name: 'Телятина', category: 'MEAT', calories: 100, protein: 19.5, fat: 2.0, carbs: 0, fiber: 0 },
    { name: 'Кролятина', category: 'MEAT', calories: 156, protein: 21.0, fat: 8.0, carbs: 0, fiber: 0 },

    // 5. POULTRY (5)
    { name: 'Куряче філе', category: 'POULTRY', calories: 110, protein: 23.0, fat: 1.2, carbs: 0, fiber: 0 },
    { name: 'Індичка (філе)', category: 'POULTRY', calories: 115, protein: 24.0, fat: 2.0, carbs: 0, fiber: 0 },
    { name: 'Качка (м’ясо зі шкірою)', category: 'POULTRY', calories: 337, protein: 18.0, fat: 28.0, carbs: 0, fiber: 0 },
    { name: 'Гуска (м’ясо зі шкірою)', category: 'POULTRY', calories: 370, protein: 15.5, fat: 33.0, carbs: 0, fiber: 0 },
    { name: 'Перепілка', category: 'POULTRY', calories: 230, protein: 22.0, fat: 18.0, carbs: 0, fiber: 0 },

    // 6. SEAFOOD (6)
    { name: 'Лосось', category: 'SEAFOOD', calories: 200, protein: 20.0, fat: 13.0, carbs: 0, fiber: 0 },
    { name: 'Тріска', category: 'SEAFOOD', calories: 78, protein: 17.5, fat: 0.7, carbs: 0, fiber: 0 },
    { name: 'Креветки', category: 'SEAFOOD', calories: 95, protein: 20.0, fat: 1.5, carbs: 0, fiber: 0 },
    { name: 'Скумбрія', category: 'SEAFOOD', calories: 195, protein: 18.0, fat: 13.0, carbs: 0, fiber: 0 },
    { name: 'Тунець свіжий', category: 'SEAFOOD', calories: 130, protein: 28.0, fat: 3.0, carbs: 0, fiber: 0 },
    { name: 'Кальмар', category: 'SEAFOOD', calories: 92, protein: 15.6, fat: 2.3, carbs: 3.1, fiber: 0 },

    // 7. GRAINS (6)
    { name: 'Гречка (суха)', category: 'GRAINS', calories: 330, protein: 12.6, fat: 3.3, carbs: 62.0, fiber: 10.0 },
    { name: 'Рис білий', category: 'GRAINS', calories: 340, protein: 7.0, fat: 0.6, carbs: 77.0, fiber: 1.3 },
    { name: 'Вівсянка', category: 'GRAINS', calories: 350, protein: 12.0, fat: 6.0, carbs: 60.0, fiber: 10.6 },
    { name: 'Кіноа (суха)', category: 'GRAINS', calories: 365, protein: 14.0, fat: 6.0, carbs: 64.0, fiber: 7.0 },
    { name: 'Булгур (сухий)', category: 'GRAINS', calories: 345, protein: 12.0, fat: 1.5, carbs: 75.0, fiber: 12.0 },
    { name: 'Кукурудзяна крупа', category: 'GRAINS', calories: 330, protein: 8.3, fat: 1.2, carbs: 71.0, fiber: 4.8 },

    // 8. LEGUMES (5)
    { name: 'Сочевиця', category: 'LEGUMES', calories: 310, protein: 24.0, fat: 1.5, carbs: 48.0, fiber: 11.0 },
    { name: 'Нут', category: 'LEGUMES', calories: 360, protein: 19.0, fat: 6.0, carbs: 60.0, fiber: 17.0 },
    { name: 'Квасоля біла', category: 'LEGUMES', calories: 330, protein: 21.0, fat: 1.2, carbs: 47.0, fiber: 15.0 },
    { name: 'Горох сухий', category: 'LEGUMES', calories: 300, protein: 20.0, fat: 2.0, carbs: 50.0, fiber: 15.0 },
    { name: 'Соя (суха)', category: 'LEGUMES', calories: 440, protein: 36.0, fat: 20.0, carbs: 30.0, fiber: 9.3 },

    // 9. NUTS_SEEDS (5)
    { name: 'Мигдаль', category: 'NUTS_SEEDS', calories: 579, protein: 21.0, fat: 49.0, carbs: 21.0, fiber: 12.5 },
    { name: 'Волоський горіх', category: 'NUTS_SEEDS', calories: 650, protein: 15.0, fat: 65.0, carbs: 7.0, fiber: 6.7 },
    { name: 'Насіння соняшника', category: 'NUTS_SEEDS', calories: 580, protein: 20.0, fat: 50.0, carbs: 20.0, fiber: 8.6 },
    { name: 'Кеш’ю', category: 'NUTS_SEEDS', calories: 553, protein: 18.2, fat: 43.8, carbs: 30.2, fiber: 3.3 },
    { name: 'Насіння гарбуза', category: 'NUTS_SEEDS', calories: 559, protein: 30.0, fat: 49.0, carbs: 10.7, fiber: 6.0 },

    // 10. EGGS (5)
    { name: 'Яйце куряче (ціле)', category: 'EGGS', calories: 155, protein: 13.0, fat: 11.0, carbs: 1.1, fiber: 0 },
    { name: 'Яйця перепелині', category: 'EGGS', calories: 160, protein: 12.0, fat: 11.0, carbs: 0.5, fiber: 0 },
    { name: 'Яєчний білок (курячий)', category: 'EGGS', calories: 52, protein: 11.0, fat: 0.2, carbs: 0.7, fiber: 0 },
    { name: 'Яєчний жовток (курячий)', category: 'EGGS', calories: 322, protein: 16.0, fat: 26.5, carbs: 3.6, fiber: 0 },
    { name: 'Меланж (сухий)', category: 'EGGS', calories: 540, protein: 45.0, fat: 37.0, carbs: 4.5, fiber: 0 },

    // 11. OILS_FATS (5)
    { name: 'Оливкова олія', category: 'OILS_FATS', calories: 884, protein: 0, fat: 99.8, carbs: 0, fiber: 0 },
    { name: 'Вершкове масло (82.5%)', category: 'OILS_FATS', calories: 748, protein: 0.5, fat: 82.5, carbs: 0.8, fiber: 0 },
    { name: 'Соняшникова олія', category: 'OILS_FATS', calories: 899, protein: 0, fat: 99.9, carbs: 0, fiber: 0 },
    { name: 'Кокосова олія', category: 'OILS_FATS', calories: 862, protein: 0, fat: 100.0, carbs: 0, fiber: 0 },
    { name: 'Сало свиняче', category: 'OILS_FATS', calories: 797, protein: 2.4, fat: 89.0, carbs: 0, fiber: 0 },

    // 12. SWEETS (5)
    { name: 'Шоколад чорний (70%)', category: 'SWEETS', calories: 540, protein: 6.0, fat: 35.0, carbs: 48.0, fiber: 7.0 },
    { name: 'Мед', category: 'SWEETS', calories: 304, protein: 0.3, fat: 0, carbs: 82.0, fiber: 0 },
    { name: 'Цукор білий', category: 'SWEETS', calories: 398, protein: 0, fat: 0, carbs: 99.8, fiber: 0 },
    { name: 'Варення малинове', category: 'SWEETS', calories: 260, protein: 0.6, fat: 0.3, carbs: 70.0, fiber: 2.0 },
    { name: 'Сироп кленовий', category: 'SWEETS', calories: 260, protein: 0, fat: 0.1, carbs: 67.0, fiber: 0 },

    // 13. BEVERAGES (5)
    { name: 'Сік апельсиновий', category: 'BEVERAGES', calories: 45, protein: 0.7, fat: 0.2, carbs: 10.0, fiber: 0.2 },
    { name: 'Кава мелена (суха)', category: 'BEVERAGES', calories: 200, protein: 14.0, fat: 14.0, carbs: 4.0, fiber: 0 },
    { name: 'Чай зелений', category: 'BEVERAGES', calories: 1, protein: 0, fat: 0, carbs: 0.2, fiber: 0 },
    { name: 'Чай чорний', category: 'BEVERAGES', calories: 1, protein: 0, fat: 0, carbs: 0.3, fiber: 0 },
    { name: 'Томатний сік', category: 'BEVERAGES', calories: 18, protein: 0.8, fat: 0.1, carbs: 4.2, fiber: 0.8 },

    // 14. BAKERY (5)
    { name: 'Хліб цільнозерновий', category: 'BAKERY', calories: 250, protein: 9.0, fat: 3.5, carbs: 45.0, fiber: 7.0 },
    { name: 'Багет', category: 'BAKERY', calories: 260, protein: 8.0, fat: 1.5, carbs: 52.0, fiber: 2.3 },
    { name: 'Хліб житній', category: 'BAKERY', calories: 215, protein: 6.0, fat: 1.0, carbs: 43.0, fiber: 6.0 },
    { name: 'Лаваш (тонкий)', category: 'BAKERY', calories: 250, protein: 8.0, fat: 1.0, carbs: 55.0, fiber: 2.0 },
    { name: 'Круасан (класичний)', category: 'BAKERY', calories: 406, protein: 8.2, fat: 21.0, carbs: 45.8, fiber: 2.6 },

    // 15. OTHER (5)
    { name: 'Печериці', category: 'OTHER', calories: 27, protein: 3.0, fat: 0.3, carbs: 3.3, fiber: 1.0 },
    { name: 'Гірчиця', category: 'OTHER', calories: 66, protein: 4.4, fat: 4.0, carbs: 5.0, fiber: 3.3 },
    { name: 'Тофу', category: 'OTHER', calories: 76, protein: 8.0, fat: 4.8, carbs: 1.9, fiber: 0.3 },
    { name: 'Соєвий соус', category: 'OTHER', calories: 53, protein: 8.0, fat: 0.1, carbs: 4.9, fiber: 0.8 },
    { name: 'Сіль морська', category: 'OTHER', calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
  ];

  console.log('🌱 Deleting existing products to perform a clean re-seed...');
  await prisma.product.deleteMany();
  console.log('  🗑️ Cleared existing products.');

  console.log('🌱 Starting comprehensive product seeding...');

  for (const item of products) {
    await prisma.product.create({
      data: {
        id: `seed-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
        ...item,
        category: item.category as ProductCategory,
        status: 'ACTIVE' as ProductStatus,
        source: 'MANUAL' as ProductSource,
        state: 'RAW' as ProductState,
        unit: 'GRAM' as Unit,
      },
    });
    console.log(`  ✅ Seeded: ${item.name} (${item.category})`);
  }

  const count = await prisma.product.count();
  console.log(`🚀 Seeding complete. Total products in database: ${count}. All 15 categories populated with 5+ items.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
