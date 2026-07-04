"use client";

import { Utensils, ClipboardList, ShoppingCart } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { NutritionPageClient } from "./NutritionPageClient";
import { MealPrep } from "./MealPrep";
import { ShoppingList } from "./ShoppingList";

export function NutritionSpaceClient() {
  return (
    <Tabs
      tabs={[
        {
          id: "daily",
          label: "Daily",
          icon: <Utensils size={16} />,
          content: <NutritionPageClient />,
        },
        {
          id: "meal-prep",
          label: "Meal Prep",
          icon: <ClipboardList size={16} />,
          content: <MealPrep />,
        },
        {
          id: "shopping-list",
          label: "Shopping List",
          icon: <ShoppingCart size={16} />,
          content: <ShoppingList />,
        },
      ]}
    />
  );
}
