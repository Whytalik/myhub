import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpaceLanding, SpaceError, ModuleQuickAccess, DailyOverview, QuickActions } from "@/components/space-landing";
import { Package, UtensilsCrossed, CalendarDays, ShoppingCart, Plus, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Food Space",
};

async function fetchFoodData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [dayPlan, dishCount, shoppingItems, weekPlan] = await Promise.all([
    prisma.dayPlan.findFirst({
      where: { userId, date: today },
      include: { entries: { include: { dish: true } } },
    }),
    prisma.dish.count({ where: { userId } }),
    prisma.shoppingListItem.count({ where: { shoppingList: { userId }, checked: false } }),
    prisma.weekPlan.findFirst({
      where: { userId, startDate: { lte: today } },
      orderBy: { startDate: "desc" },
    }),
  ]);

  return { dayPlan, dishCount, shoppingItems, weekPlan };
}

export default async function FoodSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  let foodData: Awaited<ReturnType<typeof fetchFoodData>> | null = null;
  let error: Error | null = null;

  try {
    foodData = await fetchFoodData(userId);
  } catch (e) {
    console.error("[FoodSpace] Failed to load:", e);
    error = e instanceof Error ? e : new Error(String(e));
  }

  const modules = [
    {
      title: "Products",
      href: "/food/products",
      description: "Inventories, macro-data, and source tracking.",
      icon: Package,
      status: "Active",
    },
    {
      title: "Dishes",
      href: "/food/dishes",
      description: "Recipe repository with automated macro scaling.",
      icon: UtensilsCrossed,
      status: "Active",
    },
    {
      title: "Plans",
      href: "/food/plans",
      description: "Daily & Weekly schedules with calorie targets.",
      icon: CalendarDays,
      status: "Active",
    },
    {
      title: "Shopping",
      href: "/food/shopping",
      description: "Smart aggregation of ingredients for procurement.",
      icon: ShoppingCart,
      status: "Active",
    },
  ];

  if (error) {
    return (
      <SpaceLanding
        header={{
          label: "food space",
          title: "Food Space",
          description: "Integrated nutrition management environment. Automate your meal planning, track macro-nutrients, and sync your shopping requirements with live targets.",
        }}
      >
        <SpaceError
          message="Failed to load space data. Please try refreshing the page later."
          developerError={error.message}
        />
      </SpaceLanding>
    );
  }

  const d = foodData!;
  const mealsToday = d.dayPlan?.entries.length ?? 0;
  const weekName = d.weekPlan?.name || "No active plan";

  return (
    <SpaceLanding
      header={{
        label: "food space",
        title: "Food Space",
        description: "Integrated nutrition management environment. Automate your meal planning, track macro-nutrients, and sync your shopping requirements with live targets.",
      }}
      intelligence={{
        items: [
          { label: "Macro Scaling", value: "Automatic" },
          { label: "Shopping Logic", value: "Aggregated" },
          { label: "Unit Conversion", value: "Multi-standard" },
          { label: "Data Engine", value: "PostgreSQL / Prisma" },
        ],
      }}
    >
      <DailyOverview
        title="Today"
        items={[
          { label: "Meals Planned", value: mealsToday.toString(), icon: UtensilsCrossed },
          { label: "Active Plan", value: weekName, icon: CalendarDays },
          { label: "Shopping Items", value: d.shoppingItems.toString(), icon: ShoppingCart },
          { label: "Recipes", value: d.dishCount.toString(), icon: Package },
        ]}
      />
      <QuickActions
        actions={[
          {
            label: "Create Plan",
            href: "/food/plans",
            icon: CalendarDays,
            variant: "primary",
          },
          {
            label: "Add Product",
            href: "/food/products",
            icon: Plus,
            variant: "secondary",
          },
          {
            label: "Shopping List",
            href: "/food/shopping",
            icon: FileText,
            variant: "secondary",
          },
        ]}
      />
      <ModuleQuickAccess modules={modules} />
    </SpaceLanding>
  );
}
