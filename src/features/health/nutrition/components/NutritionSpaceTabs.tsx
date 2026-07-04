"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, ClipboardList, ShoppingCart } from "lucide-react";

const tabs = [
  { href: "/health/nutrition", label: "Daily", icon: Utensils },
  { href: "/health/nutrition/meal-prep", label: "Meal Prep", icon: ClipboardList },
  { href: "/health/nutrition/shopping-list", label: "Shopping List", icon: ShoppingCart },
];

export function NutritionSpaceTabs() {
  const pathname = usePathname();

  return (
    <div className="flex w-full overflow-x-auto scrollbar-hide">
      <div className="flex p-1 bg-surface border border-border/50 rounded-xl shadow-sm w-fit relative">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex items-center gap-2 whitespace-nowrap px-4 md:px-6 py-2 rounded-lg text-note md:text-body font-medium transition-colors duration-200 ${
                isActive
                  ? "bg-accent text-bg font-semibold shadow-sm"
                  : "text-secondary hover:text-text"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
