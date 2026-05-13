import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { Package, UtensilsCrossed, CalendarDays, ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "Nutrition Space",
};

export default async function NutritionSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "nutrition space",
        title: "Nutrition Space",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Meal decisions are reactive, leading to poor nutrition and wasted time."
        solution="Recipe database, weekly meal plans with macro targets, and auto-generated shopping lists."
        result="Effortless healthy eating with zero daily decision fatigue."
      />
      <SpaceNav
        items={[
          {
            title: "Products",
            description: "Inventories & macro data",
            href: "/nutrition/products",
            icon: Package,
          },
          {
            title: "Dishes",
            description: "Recipe repository",
            href: "/nutrition/dishes",
            icon: UtensilsCrossed,
          },
          {
            title: "Plans",
            description: "Daily & weekly schedules",
            href: "/nutrition/plans",
            icon: CalendarDays,
          },
          {
            title: "Shopping",
            description: "Smart ingredient aggregation",
            href: "/nutrition/shopping",
            icon: ShoppingCart,
          },
        ]}
      />
    </SpaceLanding>
  );
}
