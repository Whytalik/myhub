"use client";

import { CalendarDays, ShoppingCart } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { DayPlan } from "./DayPlan";
import { ShoppingList } from "./ShoppingList";

export function NutritionPageClient() {
  return (
    <Tabs
      tabs={[
        { id: "day", label: "На день", icon: <CalendarDays size={14} />, content: <DayPlan /> },
        {
          id: "shopping",
          label: "Список покупок",
          icon: <ShoppingCart size={14} />,
          content: <ShoppingList />,
        },
      ]}
    />
  );
}
