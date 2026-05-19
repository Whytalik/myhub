"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { invalidateFoodCache } from "@/lib/revalidate"
import productsData from "../../nutrition/data/products.json"
import dishesData from "../../nutrition/data/dishes.json"
import { WEEKLY_SCHEDULE } from "../../nutrition/constants/meal-variants"
import { FoodProduct, CookingMethod, DishType, Unit } from "@/app/generated/prisma"

interface JsonProduct {
  name: string
  caloriesPer100: number
  proteinPer100: number
  fatPer100: number
  carbsPer100: number
  fiberPer100: number
  unit: string
  standardPackageAmount: number
  category: string
  price?: number
}

interface JsonDish {
  name: string
  type: string
  servings: number
  description?: string
  defaultSauces?: string[]
  marinades?: { ingredient: string; sauce: string }[]
  ingredients: {
    productName: string
    rawWeight: number
    cookingMethod: string
    alternatives?: string[]
  }[]
}

export async function seedVisualPlanAction(): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    
    console.log("Starting exhaustive Visual Plan Seeding...");

    // 1. GLOBAL PRODUCTS (UserId: null)
    const globalProducts: Record<string, FoodProduct> = {};

    for (const p of productsData as unknown as JsonProduct[]) {
      const productId = `global-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
      const product = await prisma.foodProduct.upsert({
        where: { id: productId },
        update: {
          caloriesPer100: p.caloriesPer100,
          proteinPer100: p.proteinPer100,
          fatPer100: p.fatPer100,
          carbsPer100: p.carbsPer100,
          fiberPer100: p.fiberPer100,
          unit: p.unit as Unit,
          standardPackageAmount: p.standardPackageAmount,
          category: p.category,
          price: p.price || 0,
        },
        create: {
          id: productId,
          userId: null,
          name: p.name,
          caloriesPer100: p.caloriesPer100,
          proteinPer100: p.proteinPer100,
          fatPer100: p.fatPer100,
          carbsPer100: p.carbsPer100,
          fiberPer100: p.fiberPer100,
          unit: p.unit as Unit,
          standardPackageAmount: p.standardPackageAmount,
          category: p.category,
          price: p.price || 0,
        }
      });
      globalProducts[p.name] = product;
    }

    // 2. COOKING METHODS MAPPING
    const cookingMethods: CookingMethod[] = await prisma.cookingMethod.findMany();
    const getMethodId = (methodName: string, category: string) => {
      if (methodName === "RAW") return cookingMethods.find(m => m.name === "Сире")?.id;
      if (methodName === "BAKED") return cookingMethods.find(m => m.name === "Запікання")?.id;
      if (methodName === "FRIED") return cookingMethods.find(m => m.name === "Смаження без олії")?.id;
      if (methodName === "BOILED") {
        if (category === "GRAINS" || category === "BAKERY") {
          return cookingMethods.find(m => m.name === "Варіння крупи/макарони")?.id;
        }
        return cookingMethods.find(m => m.name === "Варіння м'ясо/риба")?.id;
      }
      return null;
    };

    // 5. DISHES FOR USER
    for (const d of dishesData as unknown as JsonDish[]) {
      const dishId = `${d.name.replace(/\s+/g, '-').toLowerCase()}-${userId}`;
      await prisma.dishIngredient.deleteMany({ where: { dishId } });

      await prisma.dish.upsert({
        where: { id: dishId },
        update: {
          name: d.name,
          description: d.description,
          servings: d.servings,
          type: d.type as DishType,
          ingredients: {
            create: d.ingredients.map((ing) => {
              const product = globalProducts[ing.productName];
              if (!product) return null;
              return {
                productId: product.id,
                cookingMethodId: getMethodId(ing.cookingMethod, product.category),
                alternatives: ing.alternatives || []
              };
            }).filter((i): i is NonNullable<typeof i> => i !== null)
          }
        },
        create: {
          id: dishId,
          userId,
          name: d.name,
          description: d.description,
          servings: d.servings,
          type: d.type as DishType,
          ingredients: {
            create: d.ingredients.map((ing) => {
              const product = globalProducts[ing.productName];
              if (!product) return null;
              return {
                productId: product.id,
                cookingMethodId: getMethodId(ing.cookingMethod, product.category),
                alternatives: ing.alternatives || []
              };
            }).filter((i): i is NonNullable<typeof i> => i !== null)
          }
        }
      });
    }

    // 6. NUTRITION PERSONS
    const vitaliiId = "vitalii-profile";
    const gfId = "gf-profile";

    await prisma.nutritionPerson.upsert({
      where: { id: vitaliiId },
      update: { targetKcal: 1700, proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE" },
      create: {
        id: vitaliiId, userId, name: "Віталій", targetKcal: 1700,
        proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE"
      }
    });

    await prisma.nutritionPerson.upsert({
      where: { id: gfId },
      update: { targetKcal: 2300, proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN" },
      create: {
        id: gfId, userId, name: "Олеся", targetKcal: 2300,
        proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN"
      }
    });

    // 7. WEEK PLAN (Based on WEEKLY_SCHEDULE)
    const planName = "Visual Plan Week (1:1)";
    const oldPlans = await prisma.weekPlan.findMany({ where: { userId, name: planName } });
    for (const plan of oldPlans) {
      await prisma.weekPlan.delete({ where: { id: plan.id } });
    }

    const dayNamesMap: Record<string, number> = { "Пн": 0, "Вт": 1, "Ср": 2, "Чт": 3, "Пт": 4, "Сб": 5, "Нд": 6 };

    const weekPlan = await prisma.weekPlan.create({
      data: {
        name: planName,
        userId,
        dayPlans: {
          create: WEEKLY_SCHEDULE.map((ws) => ({
            userId,
            dayOfWeek: dayNamesMap[ws.day] ?? 0,
            activity: ws.activity === "gym" ? "Тренажерний зал" : "Кардіо / Біг",
            mealSlots: {
              create: [
                // Vitalii Slots
                { personId: vitaliiId, name: "Передтрен", order: 1, targetKcal: 100, targetFiberGrams: 0 },
                { personId: vitaliiId, name: "Сніданок", order: 2, targetKcal: 500, targetFiberGrams: 8 },
                { personId: vitaliiId, name: "Обід", order: 3, targetKcal: 600, targetFiberGrams: 12 },
                { personId: vitaliiId, name: "Вечеря", order: 4, targetKcal: 400, targetFiberGrams: 10 },
                // Olesya Slots
                { personId: gfId, name: "Передтрен", order: 1, targetKcal: 150, targetFiberGrams: 0 },
                { personId: gfId, name: "Сніданок", order: 2, targetKcal: 700, targetFiberGrams: 8 },
                { personId: gfId, name: "Обід", order: 3, targetKcal: 800, targetFiberGrams: 12 },
                { personId: gfId, name: "Вечеря", order: 4, targetKcal: 500, targetFiberGrams: 10 },
              ]
            }
          }))
        }
      },
      include: { dayPlans: { include: { mealSlots: true } } }
    });

    // 8. FILL SLOTS (AUTO-PORTION)
    const allDishes = await prisma.dish.findMany({
      where: { userId },
      include: { ingredients: { include: { product: true } } }
    });

    const findDish = (name: string) => allDishes.find(d => d.name === name);
    const findDishJson = (name: string) => (dishesData as unknown as JsonDish[]).find(d => d.name === name);

    // Макро-цілі кожної людини (% від kcal)
    const personMacroTargets: Record<string, { proteinPct: number; fatPct: number; carbsPct: number }> = {
      [vitaliiId]: { proteinPct: 45, fatPct: 30, carbsPct: 25 },
      [gfId]:      { proteinPct: 15, fatPct: 25, carbsPct: 60 },
    };

    // Розумне масштабування: кожен інгредієнт скейлиться пропорційно до того,
    // наскільки його домінуючий макрос відповідає цілям людини.
    // Після першого проходу нормалізуємо так, щоб загальний kcal = targetKcal.
    function computeIngredientWeights(
      ingredients: JsonDish["ingredients"],
      targetKcal: number,
      targets: { proteinPct: number; fatPct: number; carbsPct: number }
    ): number[] {
      let dishKcal = 0, dishProtKcal = 0, dishFatKcal = 0, dishCarbKcal = 0;
      for (const ing of ingredients) {
        const p = globalProducts[ing.productName];
        if (!p) continue;
        const w = ing.rawWeight / 100;
        dishKcal     += w * p.caloriesPer100;
        dishProtKcal += w * p.proteinPer100 * 4;
        dishFatKcal  += w * p.fatPer100 * 9;
        dishCarbKcal += w * p.carbsPer100 * 4;
      }

      if (dishKcal <= 0 || targetKcal <= 0) return ingredients.map(i => i.rawWeight);

      const baseScale = targetKcal / dishKcal;
      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

      // Коефіцієнти коригування: наскільки більше/менше кожного макросу хоче людина порівняно з профілем страви
      const protAdj = dishProtKcal > dishKcal * 0.02 ? clamp(targets.proteinPct / (dishProtKcal / dishKcal * 100), 0.25, 4.0) : 1;
      const fatAdj  = dishFatKcal  > dishKcal * 0.02 ? clamp(targets.fatPct  / (dishFatKcal  / dishKcal * 100), 0.25, 4.0) : 1;
      const carbAdj = dishCarbKcal > dishKcal * 0.02 ? clamp(targets.carbsPct / (dishCarbKcal / dishKcal * 100), 0.25, 4.0) : 1;

      // Перший прохід: коригуємо кожен інгредієнт по його макро-профілю
      const firstPass = ingredients.map(ing => {
        const p = globalProducts[ing.productName];
        if (!p) return ing.rawWeight * baseScale;
        const macroKcal = (ing.rawWeight / 100) * (p.proteinPer100 * 4 + p.fatPer100 * 9 + p.carbsPer100 * 4);
        // Дрібні приправи — без коригування
        if (macroKcal < 0.5) return ing.rawWeight * baseScale;
        const total = p.proteinPer100 * 4 + p.fatPer100 * 9 + p.carbsPer100 * 4;
        const pF = (p.proteinPer100 * 4) / total;
        const fF = (p.fatPer100 * 9) / total;
        const cF = (p.carbsPer100 * 4) / total;
        return ing.rawWeight * baseScale * (pF * protAdj + fF * fatAdj + cF * carbAdj);
      });

      // Нормалізація до targetKcal
      let fp = 0;
      for (let i = 0; i < ingredients.length; i++) {
        const p = globalProducts[ingredients[i].productName];
        if (p) fp += firstPass[i] * p.caloriesPer100 / 100;
      }
      const norm = fp > 0 ? targetKcal / fp : 1;
      return firstPass.map(w => w * norm);
    }

    for (const day of weekPlan.dayPlans) {
      const dayName = Object.keys(dayNamesMap).find(key => dayNamesMap[key] === day.dayOfWeek);
      const ws = WEEKLY_SCHEDULE.find(s => s.day === (dayName ?? ""));
      if (!ws) continue;

      for (const slot of day.mealSlots) {
        let dishName = ws.defaults[slot.name as keyof typeof ws.defaults];

        // Special case: Friday Dinner is Fast Food
        if (dayName === "Пт" && slot.name === "Вечеря") {
          dishName = "Кебаб Класичний";
        }

        if (!dishName) continue;

        const dish = findDish(dishName);
        const dishJson = findDishJson(dishName);
        if (dish && dishJson) {
          const personTargets = personMacroTargets[slot.personId] ?? { proteinPct: 30, fatPct: 28, carbsPct: 42 };
          const finalWeights = computeIngredientWeights(dishJson.ingredients, slot.targetKcal, personTargets);

          const dishEntry = await prisma.dishEntry.create({
            data: {
              mealSlotId: slot.id,
              dishId: dish.id,
            }
          });

          await prisma.dishEntryIngredient.createMany({
            data: dishJson.ingredients.map((ing, idx) => {
              const prod = globalProducts[ing.productName];
              return {
                dishEntryId: dishEntry.id,
                ingredientIndex: idx,
                weight: finalWeights[idx],
                inputState: "RAW",
                unit: prod?.unit ?? null,
              };
            })
          });

          for (const sauceName of (dishJson.defaultSauces ?? [])) {
            const sauceDish = findDish(sauceName);
            const sauceJson = findDishJson(sauceName);
            if (sauceDish && sauceJson) {
              const sauceEntry = await prisma.dishEntry.create({
                data: { mealSlotId: slot.id, dishId: sauceDish.id }
              });
              await prisma.dishEntryIngredient.createMany({
                data: sauceJson.ingredients.map((ing, idx) => {
                  const prod = globalProducts[ing.productName];
                  return {
                    dishEntryId: sauceEntry.id,
                    ingredientIndex: idx,
                    weight: ing.rawWeight,
                    inputState: "RAW",
                    unit: prod?.unit ?? null,
                  };
                })
              });
            }
          }

          for (const m of (dishJson.marinades ?? [])) {
            const marinDish = findDish(m.sauce);
            const marinJson = findDishJson(m.sauce);
            if (marinDish && marinJson) {
              const marinEntry = await prisma.dishEntry.create({
                data: {
                  mealSlotId: slot.id,
                  dishId: marinDish.id,
                  marinadeForIngredient: m.ingredient,
                }
              });
              await prisma.dishEntryIngredient.createMany({
                data: marinJson.ingredients.map((ing, idx) => {
                  const prod = globalProducts[ing.productName];
                  return {
                    dishEntryId: marinEntry.id,
                    ingredientIndex: idx,
                    weight: ing.rawWeight,
                    inputState: "RAW",
                    unit: prod?.unit ?? null,
                  };
                })
              });
            }
          }
        }
      }
    }

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Seed Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Seed failed" }
  }
}

// Cooking list templates per day — optimized sequential instructions
// Each list covers ALL meals of the day, ordered for minimum total cooking time
const COOKING_LISTS: Record<number, string> = {
  0: `ПН — Готуємо все за раз:

1. Поставити варитись гречку для Боулу (100г Віталій + 120г Олеся) — ~20хв
2. Поставити запікатись куряче філе для Боулу (100г + 150г) — 180°C, ~25хв
3. Поки готується: збити яйця (50г) + куряче філе (100г) для омлету, обсмажити на сковороді — ~8хв
4. Нарізати помідори для омлету, підсмажити ЦЗ хліб (30г + 60г)
5. Нарізати овочі для Боулу: морква, огірок, помідор, яблуко
6. Дістати курку з духовки, нарізати для Боулу
7. Зібрати Боули: гречка + курка + овочі + олія оливкова + соєво-медовий соус
8. Овочеве Рагу (Вечеря): нарізати картоплю (100г + 150г), моркву (60г + 100г), кабачок (100г + 150г), перець (50г + 100г)
9. Поставити тушкуватись рагу з томатною пастою (10г + 20г) + куряче філе (150г + 150г) + квасоля (50г + 50г) — ~20хв
10. Передтрен: рисові хлібці (7г + 14г) + мед (7г + 14г) — готове, не готувати`,

  1: `ВТ — Суп + Панкейки + Салат:

1. Поставити варитись червону сочевицю для Супу (100г + 120г) — ~15хв
2. Додати в суп картоплю (100г + 200г), моркву (50г + 80г), цибулю (30г + 50г) — варити ще ~15хв
3. Поки суп вариться: приготувати Сирні панкейки — змішати сир (150г + 200г), яйце (50г + 100г), ЦЗ борошно (20г + 40г)
4. Додати в тісто яблуко (80г + 120г), мед (5г + 10г), корицю, ванілін
5. Смажити панкейки на сковороді — ~10хв
6. Поки панкейки: нарізати куряче філе (150г + 150г) для Протеїнового Салату
7. Обсмажити філе до готовності — ~8хв
8. Нарізати для салату: айсберг (200г + 300г), огірок (100г + 200г), рис (100г + 120г) — рис поставити варитись
9. Додати в суп петрушку (5г + 10г), куркуму, лавровий лист — доварити
10. Зібрати салати: рис + філе + овочі + йогурт з кропом
11. Передтрен: банан (120г + 150г) + теплий чай — готове`,

  2: `СР — Боул + Омлет + Риба:

1. Поставити варитись гречку для Боулу (100г + 120г) — ~20хв
2. Поставити запікатись куряче філе для Боулу (100г + 150г) — 180°C, ~25хв
3. Поки готується: збити яйця (50г) + куряче філе (100г) для омлету, обсмажити — ~8хв
4. Нарізати помідори для омлету, підсмажити ЦЗ хліб (30г + 60г)
5. Нарізати овочі для Боулу: морква, огірок, помідор, яблуко
6. Поставити варитись гречку для вечері (100г + 150г) — ~20хв
7. Поки гречка: підготувати хек (150г + 150г) — посолити, поперчити, полити олією
8. Поставити запікатись хек — 180°C, ~20хв
9. Поставити варитись броколі (100г + 150г) — ~5хв
10. Дістати курку з духовки, нарізати для Боулу
11. Зібрати Боули: гречка + курка + овочі + олія + соус
12. Зібрати вечерю: гречка + хек + броколі + грецький йогурт (15г + 30г)
13. Передтрен: рисові хлібці (7г + 14г) + мед (7г + 14г) — готове`,

  3: `ЧТ — Паста + Wrap + Сир:

1. Поставити варитись макарони ТЗ для Пасті (120г + 150г) — ~10хв
2. Поки макарони: обсмажити куряче філе (100г + 150г) з цибулею (30г + 50г) та морквою (50г + 80г) — ~10хв
3. Додати томатну пасату (100г + 150г), орегано + базилік — тушкувати соус ~5хв
4. Змішати макарони з соусом, посипати твердим сиром (10г + 30г)
5. Приготувати Breakfast Wrap: лаваш (50г + 50г) розкласти
6. Обсмажити куряче філе (100г + 120г) для wrap — ~8хв
7. Приготувати яйце-скрембл (50г + 100г) — ~3хв
8. Нарізати для wrap: айсберг (100г + 150г), помідор (50г + 100г), цибуля червона (15г + 30г)
9. Загорнути wrap, додати насіння льону (10г + 15г), лимонний сік
10. Солодкий Сир (Вечеря): змішати сир (250г + 250г) + яблуко (100г + 150г) + арахіс (10г + 25г) + мед (5г + 10г) + кориця — готове
11. Передтрен: солона соломка (40г + 50г) + теплий чай — готове`,

  4: `ПТ — Печена тарілка + Омлет + Кебаб:

1. Поставити запікатись картоплю для Печеної тарілки (200г + 350г) — 180°C, ~35хв
2. Підготувати хек (150г + 150г) — посолити, полити лимонно-трав'яним соусом
3. Покласти хек до картопли в духовку — запікатись разом ~20хв
4. Поки запікається: збити яйця (50г) + куряче філе (100г) для омлету, обсмажити — ~8хв
5. Нарізати помідори для омлету, підсмажити ЦЗ хліб (30г + 60г)
6. Дістати картоплю і хек з духовки
7. Подати Печену тарілку: картопля + хек + морква по-корейськи (80г + 150г) + гірчиця діжонська
8. Вечеря — Кебаб Класичний: замовити / купити готовий, не готувати
9. Передтрен: рисові хлібці (7г + 14г) + мед (7г + 14г) — готове`,

  5: `СБ — Паста + Панкейки + Рагу:

1. Поставити варитись макарони ТЗ для Пасті (120г + 150г) — ~10хв
2. Поки макарони: обсмажити куряче філе (100г + 150г) з цибулею (30г + 50г) та морквою (50г + 80г) — ~10хв
3. Додати томатну пасату (100г + 150г), орегано + базилік — тушкувати соус ~5хв
4. Змішати макарони з соусом, посипати твердим сиром (10г + 30г)
5. Приготувати Сирні панкейки: змішати сир (150г + 200г), яйце (50г + 100г), ЦЗ борошно (20г + 40г)
6. Додати в тісто яблуко (80г + 120г), мед (5г + 10г), корицю, ванілін
7. Смажити панкейки на сковороді — ~10хв
8. Овочеве Рагу (Вечеря): нарізати картоплю (100г + 150г), моркву (60г + 100г), кабачок (100г + 150г), перець (50г + 100г)
9. Поставити тушкуватись рагу з томатною пастою (10г + 20г) + куряче філе (150г + 150г) + квасоля (50г + 50г) — ~20хв
10. Передтрен: солона соломка (40г + 50г) + теплий чай — готове`,

  6: `НД — Суп + Тости + Салат:

1. Поставити варитись червону сочевицю для Супу (100г + 120г) — ~15хв
2. Додати в суп картоплю (100г + 200г), моркву (50г + 80г), цибулю (30г + 50г) — варити ще ~15хв
3. Поки суп вариться: приготувати Тости з тунцем — відкрити тунець (90г + 185г)
4. Зварити яйця (50г + 100г) — ~10хв
5. Підсмажити ЦЗ хліб (30г + 60г)
6. Нарізати для тостів: огірок (80г + 120г), викласти тунець + яйце + гірчиця
7. Посипати насінням льону (10г + 15г)
8. Додати в суп петрушку (5г + 10г), куркуму, лавровий лист — доварити
9. Протеїновий Салат (Вечеря): зварити рис (100г + 120г) — ~15хв
10. Нарізати: айсберг (200г + 300г), огірок (100г + 200г)
11. Підготувати тунець (150г + 150г) або куряче філе
12. Зібрати салати: рис + тунець/філе + овочі + йогурт з кропом
13. Передтрен: банан (120г + 150г) + теплий чай — готове`,
}

export async function seedCookingLists(): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const weekPlan = await prisma.weekPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        dayPlans: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    })

    if (!weekPlan) return { success: false, error: "No week plan found. Run seedVisualPlanAction first." }

    for (const day of weekPlan.dayPlans) {
      const cookingContent = COOKING_LISTS[day.dayOfWeek]
      if (!cookingContent) continue

      await prisma.dayPrepNote.upsert({
        where: { dayPlanId: day.id },
        create: {
          dayPlanId: day.id,
          content: cookingContent,
          steps: [],
        },
        update: {
          content: cookingContent,
        },
      })
    }

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Seed Cooking Lists Error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed" }
  }
}

/**
 * Unified action to seed the entire nutrition system at once.
 * 1. Seeds Visual Plan (Products, Dishes, Profiles, Week Plan)
 * 2. Seeds Cooking Instructions (Step-by-step logic for the Plan)
 */
export async function seedFullNutritionSystemAction(): Promise<ActionResult<void>> {
  const visualResult = await seedVisualPlanAction();
  if (!visualResult.success) return visualResult;

  const cookingResult = await seedCookingLists();
  return cookingResult;
}

