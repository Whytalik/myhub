"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDashed, Star } from "lucide-react";
import type { ProductMappingOverviewItem } from "../services/product-mapping-service";
import type { FoodMacros, ProductCategory } from "../products";
import { FoodMapperDialog } from "./FoodMapperDialog";

interface FoodMapperClientProps {
  initialOverview: ProductMappingOverviewItem[];
}

const CATEGORY_ORDER: ProductCategory[] = [
  "meat",
  "dairy",
  "vegetables",
  "fruits",
  "grains",
  "other",
];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  meat: "М'ясо та риба",
  dairy: "Молочне",
  vegetables: "Овочі",
  fruits: "Фрукти",
  grains: "Крупи",
  other: "Інше",
};

function formatMacros(macros: FoodMacros): string {
  return `${macros.kcal} ккал · Б${macros.protein} Ж${macros.fat} В${macros.carbs}`;
}

export function FoodMapperClient({ initialOverview }: FoodMapperClientProps) {
  // 1. Hooks
  const router = useRouter();
  const [openProductKey, setOpenProductKey] = useState<string | null>(null);

  // 2. Derived values
  const openItem = initialOverview.find((item) => item.productKey === openProductKey) ?? null;
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    items: initialOverview.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  // 3. Handlers
  const handleClose = () => setOpenProductKey(null);
  const handleSaved = () => {
    setOpenProductKey(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-2">
          <span className="text-label">{group.label}</span>

          {group.items.map((item) => {
            const isMapped = Boolean(item.mapping);
            const statusClass = isMapped ? "text-emerald-400" : "text-zinc-500";
            const StatusIcon = isMapped ? CheckCircle2 : CircleDashed;

            return (
              <div
                key={item.productKey}
                className="glass-card p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <StatusIcon size={16} className={`${statusClass} shrink-0`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-body truncate">{item.nameUk}</span>
                    {isMapped && (
                      <span className="text-label truncate">
                        {item.foodName ?? `food ${item.mapping?.foodId}`}
                        {item.servingDescription ? ` · ${item.servingDescription}` : ""}
                      </span>
                    )}
                    {item.targetMacros && (
                      <span className="text-label truncate text-zinc-500">
                        Ціль (100г): {formatMacros(item.targetMacros)}
                      </span>
                    )}
                    {item.actualMacrosPer100g && (
                      <span className="text-label truncate text-zinc-500">
                        Факт (100г): {formatMacros(item.actualMacrosPer100g)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenProductKey(item.productKey)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-accent-nutrition hover:opacity-80 transition-opacity"
                >
                  <Star size={13} />
                  {isMapped ? "Змінити" : "Мапувати"}
                </button>
              </div>
            );
          })}
        </div>
      ))}

      {openItem && (
        <FoodMapperDialog
          isOpen
          onClose={handleClose}
          onSaved={handleSaved}
          productKey={openItem.productKey}
          productNameUk={openItem.nameUk}
        />
      )}
    </div>
  );
}
