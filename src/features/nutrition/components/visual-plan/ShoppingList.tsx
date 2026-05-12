"use client";

import { useState, useEffect } from "react";
import { FAST_FOOD_PICKS, FF_STORAGE_KEY, FF_EVENT, type FfCategory } from "../../constants/fast-food-picks";
import {
  WEEKLY_SCHEDULE,
  MEAL_VARIANTS,
  CHOICES_STORAGE_KEY,
  CHOICES_EVENT,
} from "../../constants/meal-variants";
import { PRODUCT_INFO } from "../../constants/product-info";
import { SAUCES } from "../../constants/sauces";

type CategoryKey = FfCategory | string;

type CategoryDef = {
  key: CategoryKey;
  emoji: string;
  label: string;
  border: string;
  textColor: string;
  dot: string;
};

const ALL_CATEGORIES: CategoryDef[] = [
  { key: "fruits",  emoji: "🍎", label: "Фрукти",          border: "border-[#4ade80]/30", textColor: "text-[#4ade80]", dot: "bg-[#4ade80]/50" },
  { key: "bread",   emoji: "🍞", label: "Хліб / Снеки",    border: "border-[#fb923c]/30", textColor: "text-[#fb923c]", dot: "bg-[#fb923c]/50" },
  { key: "meat",    emoji: "🥩", label: "М'ясо / Риба",    border: "border-[#fb7185]/30", textColor: "text-[#fb7185]", dot: "bg-[#fb7185]/50" },
  { key: "dairy",   emoji: "🧀", label: "Молочне / Яйця",  border: "border-[#38bdf8]/30", textColor: "text-[#38bdf8]", dot: "bg-[#38bdf8]/50" },
  { key: "veggies", emoji: "🥦", label: "Овочі",            border: "border-[#4ade80]/30", textColor: "text-[#4ade80]", dot: "bg-[#4ade80]/50" },
  { key: "grains",  emoji: "🌾", label: "Крупи / Борошно", border: "border-[#fb923c]/30", textColor: "text-[#fb923c]", dot: "bg-[#fb923c]/50" },
  { key: "spices",  emoji: "🫙", label: "Спеції / Інше",   border: "border-[#c084fc]/30", textColor: "text-[#c084fc]", dot: "bg-[#c084fc]/50" },
  { key: "drinks",  emoji: "☕", label: "Напої",            border: "border-[#38bdf8]/30", textColor: "text-[#38bdf8]", dot: "bg-[#38bdf8]/50" },
];

type ProductTotals = {
  totalGrams: number;
  totalPrice: number;
  info: typeof PRODUCT_INFO[string] | undefined;
};

function buildProductTotals(
  productChoices: Record<string, string>,
): Map<string, ProductTotals> {
  const map = new Map<string, ProductTotals>();

  for (const row of WEEKLY_SCHEDULE) {
    for (const [mealType, variants] of Object.entries(MEAL_VARIANTS)) {
      if (row.day === "Пт" && mealType === "Вечеря") continue;

      const variantName = row.defaults[mealType];
      if (!variantName) continue;

      const variant = variants.find((v) => v.name === variantName);
      if (!variant) continue;

      variant.products.forEach((product, pIdx) => {
        const resolvedName = productChoices[`${row.day}-${mealType}-${pIdx}`] ?? product.name;

        // Експансія соусів та маринадів
        const sauce = SAUCES[resolvedName];
        if (sauce) {
          sauce.ingredients.forEach((ing) => {
            const info = PRODUCT_INFO[ing.name];
            const existing = map.get(ing.name) ?? { totalGrams: 0, totalPrice: 0, info };
            existing.totalGrams += ing.grams;
            if (info?.price) {
              existing.totalPrice += parsePricePer100g(info.price) * (ing.grams / 100);
            }
            map.set(ing.name, existing);
          });
          return;
        }

        const grams = product.youGrams + product.herGrams;
        if (grams <= 0) return;

        const info = PRODUCT_INFO[resolvedName];

        const existing = map.get(resolvedName) ?? { totalGrams: 0, totalPrice: 0, info };
        existing.totalGrams += grams;

        if (info?.price) {
          existing.totalPrice += parsePricePer100g(info.price) * (grams / 100);
        }

        map.set(resolvedName, existing);
      });
    }
  }

  return map;
}

function parsePricePer100g(priceStr: string): number {
  const match = priceStr.match(/(\d+)/);
  if (!match) return 0;
  const midPrice = parseInt(match[1], 10);

  if (priceStr.includes("/кг")) return midPrice / 10;
  if (priceStr.includes("/100г")) return midPrice;
  if (priceStr.includes("/500г")) return midPrice / 5;
  if (priceStr.includes("/250г")) return midPrice / 2.5;
  if (priceStr.includes("/400г")) return midPrice / 4;
  if (priceStr.includes("/350г")) return midPrice / 3.5;
  if (priceStr.includes("/200г")) return midPrice / 2;
  if (priceStr.includes("/185г")) return midPrice / 1.85;
  if (priceStr.includes("/50г")) return midPrice / 0.5;
  if (priceStr.includes("/20г")) return midPrice / 0.2;
  if (priceStr.includes("/л") || priceStr.includes("/500мл") || priceStr.includes("/250мл")) return midPrice / 10;
  if (priceStr.includes("/шт") || priceStr.includes("/уп") || priceStr.includes("/бан") || priceStr.includes("/пуч") || priceStr.includes("/голова") || priceStr.includes("/бух") || priceStr.includes("/арк") || priceStr.includes("/пак")) return midPrice / 5;

  return midPrice / 10;
}

function formatGrams(grams: number): string {
  if (grams < 1000) return `${Math.round(grams)}г`;
  return `${(grams / 1000).toFixed(1).replace(/\.0$/, "")} кг`;
}

type CategoryCardProps = CategoryDef & { items: { name: string; totals: ProductTotals }[] };

function CategoryCard({ emoji, label, border, textColor, dot, items }: CategoryCardProps) {
  return (
    <div className={`bg-[#1e2130] border ${border} rounded-xl overflow-hidden`}>
      <div className="flex items-center gap-4 px-5 py-4 border-b border-[#3e4158]">
        <div className={`flex items-center gap-2 text-sm font-bold uppercase ${textColor} flex-1 min-w-0`}>
          <span className="text-base">{emoji}</span>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2 w-48 shrink-0 font-mono text-xs text-gray-400">
          <span className="w-10 text-right">К</span>
          <span className="w-10 text-right">Б</span>
          <span className="w-10 text-right">Ж</span>
          <span className="w-10 text-right">В</span>
          <span className="text-[10px] text-gray-500">/100г</span>
        </div>
        <div className="w-40 shrink-0 font-mono text-xs text-gray-400">Ціна / од.</div>
        <div className="w-20 shrink-0 text-center font-mono text-xs text-gray-400">К-сть</div>
        <div className="w-24 shrink-0 text-right font-mono text-xs text-gray-400">Сума</div>
      </div>

      <ul className="divide-y divide-[#3e4158]/50">
        {items.map(({ name, totals }) => {
          const { info, totalGrams, totalPrice } = totals;
          return (
            <li key={name} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0`} />
                <span className="text-sm text-white font-medium truncate">{name}</span>
              </div>

              <div className="flex items-center gap-2 w-48 shrink-0 font-mono text-xs">
                {info ? (
                  <>
                    <span className={`w-10 text-right font-semibold ${textColor}`}>{info.kcal}</span>
                    <span className="w-10 text-right text-[#38bdf8]">{info.protein}г</span>
                    <span className="w-10 text-right text-[#fb923c]">{info.fat}г</span>
                    <span className="w-10 text-right text-[#c084fc]">{info.carbs}г</span>
                  </>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>

              <div className="w-40 shrink-0 font-mono text-xs text-gray-300">
                {info?.price ?? "—"}
              </div>

              <div className="w-20 shrink-0 text-center font-mono text-xs text-white font-semibold">
                {formatGrams(totalGrams)}
              </div>

              <div className="w-24 shrink-0 text-right font-mono text-xs text-[#4ade80] font-semibold">
                {totalPrice > 0 ? `${Math.round(totalPrice)} грн` : "—"}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShoppingList() {
  const [selectedFfId, setSelectedFfId] = useState<string | null>(null);
  const [productChoices, setProductChoices] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedFf = localStorage.getItem(FF_STORAGE_KEY);
    const savedChoices = localStorage.getItem(CHOICES_STORAGE_KEY);
    
    Promise.resolve().then(() => {
      if (savedFf) setSelectedFfId(savedFf);
      if (savedChoices) {
        try { setProductChoices(JSON.parse(savedChoices)); } catch {}
      }
    });

    const ffHandler = (e: Event) => setSelectedFfId((e as CustomEvent<string | null>).detail);
    const choicesHandler = (e: Event) => setProductChoices((e as CustomEvent<Record<string, string>>).detail);

    window.addEventListener(FF_EVENT, ffHandler);
    window.addEventListener(CHOICES_EVENT, choicesHandler);
    return () => {
      window.removeEventListener(FF_EVENT, ffHandler);
      window.removeEventListener(CHOICES_EVENT, choicesHandler);
    };
  }, []);

  const productTotals = buildProductTotals(productChoices);

  const selectedFf = FAST_FOOD_PICKS.find((f) => f.id === selectedFfId) ?? null;
  if (selectedFf) {
    for (const item of selectedFf.items) {
      const info = PRODUCT_INFO[item.name];
      const existing = productTotals.get(item.name) ?? { totalGrams: 0, totalPrice: 0, info };
      if (info) {
        existing.info = info;
        existing.totalGrams += 100;
        if (info.price) {
          existing.totalPrice += parsePricePer100g(info.price);
        }
      }
      productTotals.set(item.name, existing);
    }
  }

  const groupedByCategory = new Map<string, { def: CategoryDef; items: { name: string; totals: ProductTotals }[] }>();

  for (const [name, totals] of productTotals) {
    const cat = totals.info?.category ?? "spices";
    const def = ALL_CATEGORIES.find((c) => c.key === cat) ?? ALL_CATEGORIES[6];
    if (!groupedByCategory.has(cat)) {
      groupedByCategory.set(cat, { def, items: [] });
    }
    groupedByCategory.get(cat)!.items.push({ name, totals });
  }

  let grandTotal = 0;
  for (const [, totals] of productTotals) {
    grandTotal += totals.totalPrice;
  }

  const sortedCategories = ALL_CATEGORIES
    .filter((cat) => groupedByCategory.has(cat.key))
    .map((cat) => ({
      ...groupedByCategory.get(cat.key)!,
    }));

  return (
    <>
      <div className="flex flex-col gap-4 mb-6 overflow-x-auto">
        {sortedCategories.map(({ def, items }) => (
          <CategoryCard
            key={def.key}
            emoji={def.emoji}
            label={def.label}
            border={def.border}
            textColor={def.textColor}
            dot={def.dot}
            items={items.sort((a, b) => a.name.localeCompare(b.name, "uk"))}
          />
        ))}
      </div>

      <div className="flex items-center justify-between bg-[#1e2130] border border-[#3e4158] rounded-xl px-6 py-4">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Загальна сума</span>
        <span className="text-base font-mono text-[#4ade80] font-bold">{Math.round(grandTotal)} грн</span>
      </div>
    </>
  );
}
