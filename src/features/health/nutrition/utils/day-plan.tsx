import { PRODUCTS, getProductName } from "../products";
import { formatGrams } from "../quantities";
import { findMentionedPantryProductKeys } from "../highlight-products";
import type { ResolvedDayView } from "../cycle";
import type { Meal, MacroItem, MealType, PrepSection } from "../types";

export function isRepeatPortion(meal: Meal): boolean {
  return meal.ingredients.some((ing) => {
    const lower = ing.toLowerCase();
    return lower.includes("друга порція") || lower.includes("обідньої страви");
  });
}

export interface ServingGroup {
  label: string;
  vitalii: number;
  olesia: number;
  foodKey?: string;
}

export interface ServingEntry {
  labels: string[];
  title: string;
  mealType: MealType;
  groups: ServingGroup[];
  rawMacroItems: MacroItem[];
}

/**
 * Об'єднує прийоми їжі в блоки для сервування: "друга порція" (той самий
 * приготований обсяг, з'їдений за два рази) зливається з попереднім
 * прийомом, а не показується як ще одна повна порція зверху — інакше
 * реальна кількість подвоюється проти того, що фактично приготовано.
 * Продукти всередині прийому групуються за `component` (складова страви,
 * напр. "Грецький салат"), щоб показати порцію страви, а не кожен
 * інгредієнт окремо.
 */
export function buildServingEntries(meals: Meal[]): ServingEntry[] {
  const entries: ServingEntry[] = [];

  for (const meal of meals) {
    if (isRepeatPortion(meal) && entries.length > 0) {
      entries[entries.length - 1].labels.push(meal.label);
      continue;
    }

    const groups = new Map<string, ServingGroup & { component?: string }>();
    for (const item of meal.macroItems ?? []) {
      if (item.vitalii <= 0 && item.olesia <= 0) continue;
      const key = item.component ?? item.food;
      const existing = groups.get(key);
      if (existing) {
        existing.vitalii += item.vitalii;
        existing.olesia += item.olesia;
        if (existing.foodKey !== item.food) {
          existing.foodKey = undefined;
        }
      } else {
        groups.set(key, {
          label: key,
          component: item.component,
          vitalii: item.vitalii,
          olesia: item.olesia,
          foodKey: item.food,
        });
      }
    }

    // Component на групі з єдиним foodKey — це лише позначка призначення
    // (напр. "Для смаження курки"), не назва самостійної страви з кількох
    // продуктів (як "Капрезе") — тому показуємо назву продукту, а
    // призначення додаємо в дужках, а не ховаємо продукт за поміткою.
    const finalizedGroups: ServingGroup[] = [...groups.values()].map(({ component, ...group }) => ({
      ...group,
      label: group.foodKey
        ? component
          ? `${getProductName(group.foodKey)} (${component})`
          : getProductName(group.foodKey)
        : group.label,
    }));

    entries.push({
      labels: [meal.label],
      title: meal.title,
      mealType: meal.type,
      groups: finalizedGroups,
      rawMacroItems: meal.macroItems ?? [],
    });
  }

  return entries;
}

export interface DayProductTotal {
  foodKey: string;
  name: string;
  vitalii: number;
  olesia: number;
}

/**
 * Підсумовує кожен продукт за весь день напряму з `macroItems` (структуровані
 * дані), а не з вільнотекстових `ingredients` — деякі рядки тексту описують
 * одразу кілька продуктів в одному реченні (напр. "Для салату: помідори...,
 * огірок..., перець...") і не розбиваються чисто на "продукт" + "кількість".
 */
export function buildDayProductTotals(meals: Meal[], prepSteps?: PrepSection[]): DayProductTotal[] {
  const totals = new Map<string, DayProductTotal>();

  for (const meal of meals) {
    for (const item of meal.macroItems ?? []) {
      if (item.vitalii <= 0 && item.olesia <= 0) continue;
      const name = getProductName(item.food);
      const existing = totals.get(item.food);
      if (existing) {
        existing.vitalii += item.vitalii;
        existing.olesia += item.olesia;
      } else {
        totals.set(item.food, {
          foodKey: item.food,
          name,
          vitalii: item.vitalii,
          olesia: item.olesia,
        });
      }
    }
  }

  // Pantry products (спеції) carry no macros, so they never show up above —
  // recover them from the day's free text instead, with a "—" quantity.
  const texts = [
    ...meals.flatMap((meal) => meal.ingredients),
    ...(prepSteps?.flatMap((section) => section.steps) ?? []),
  ];
  for (const key of findMentionedPantryProductKeys(texts)) {
    if (totals.has(key)) continue;
    totals.set(key, { foodKey: key, name: getProductName(key), vitalii: 0, olesia: 0 });
  }

  return [...totals.values()];
}

export function splitRepeatMeals(day: ResolvedDayView): ResolvedDayView {
  // Deep copy meals so we don't mutate the static SET_PLAN
  const meals: Meal[] = day.meals.map((meal) => ({
    ...meal,
    macroItems: meal.macroItems ? meal.macroItems.map((item) => ({ ...item })) : [],
    ingredients: [...meal.ingredients],
  }));

  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];
    if (meal.type === "dinner" && isRepeatPortion(meal)) {
      const lunch = meals.find((m) => m.type === "lunch");
      if (lunch && lunch.macroItems && lunch.macroItems.length > 0) {
        const lunchHalfItems: MacroItem[] = [];
        const dinnerHalfItems: MacroItem[] = [];

        for (const item of lunch.macroItems) {
          // Halve values, rounding to 1 decimal place to avoid float issues
          const vHalf = Math.round((item.vitalii / 2) * 10) / 10;
          const oHalf = Math.round((item.olesia / 2) * 10) / 10;

          lunchHalfItems.push({
            ...item,
            vitalii: vHalf,
            olesia: oHalf,
          });

          dinnerHalfItems.push({
            ...item,
            vitalii: vHalf,
            olesia: oHalf,
          });
        }

        lunch.macroItems = lunchHalfItems;
        meal.macroItems = dinnerHalfItems;
        meal.title = lunch.title;
        meal.ingredients = [
          "Друга порція обідньої страви (розігріти м'ясо та гарнір, салат зробити свіжим)",
        ];
      }
    }
  }

  return {
    ...day,
    meals,
  };
}

export interface ServingDisplay {
  totalLabel: string;
  vitalii: React.ReactNode;
  olesia: React.ReactNode;
}

/** Shared weight formatting (raw vs. cooked, per-person %) for both the mobile card list and the desktop table. */
export function computeServingDisplay(group: ServingGroup): ServingDisplay {
  const product = group.foodKey ? PRODUCTS[group.foodKey] : undefined;
  const multiplier = product?.cookedMultiplier;
  const gramsPerPiece = product?.gramsPerPiece;

  const totalRaw = group.vitalii + group.olesia;
  const vitaliiPct = totalRaw > 0 ? Math.round((group.vitalii / totalRaw) * 100) : 0;
  const olesiaPct = totalRaw > 0 ? 100 - vitaliiPct : 0;
  const showPct = totalRaw > 0 && group.vitalii > 0 && group.olesia > 0;

  let totalLabel = "";
  if (showPct) {
    totalLabel = multiplier
      ? `~${Math.round(totalRaw * multiplier)} г готового`
      : gramsPerPiece
        ? `${formatGrams(totalRaw, "piece", gramsPerPiece)} (${totalRaw} г)`
        : product?.key === "milk"
          ? `~${Math.round(totalRaw)} мл`
          : `~${Math.round(totalRaw)} г`;
  }

  const formatWeight = (rawWeight: number, pct: number) => {
    if (rawWeight <= 0) return "—";
    const pctSuffix = showPct ? ` (${pct}%)` : "";

    if (gramsPerPiece) {
      return `${formatGrams(rawWeight, "piece", gramsPerPiece)} (${rawWeight} г)${pctSuffix}`;
    }

    if (product?.key === "milk") {
      return `${Math.round(rawWeight)} мл${pctSuffix}`;
    }

    if (multiplier) {
      const rawLabel = product?.category === "grains" ? "сух." : "сир.";
      return (
        <span className="flex flex-col items-end sm:inline sm:space-x-1">
          <span className="text-zinc-500">
            {rawWeight} г ({rawLabel})
          </span>
          <span className="hidden sm:inline text-zinc-600 mx-1.5">→</span>
          <span className="text-accent-nutrition font-bold">
            ~{Math.round(rawWeight * multiplier)} г (гот.){pctSuffix}
          </span>
        </span>
      );
    }
    return `${rawWeight} г${pctSuffix}`;
  };

  return {
    totalLabel,
    vitalii: formatWeight(group.vitalii, vitaliiPct),
    olesia: formatWeight(group.olesia, olesiaPct),
  };
}
