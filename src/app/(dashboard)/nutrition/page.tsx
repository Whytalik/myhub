import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpaceLanding, SpaceError, ModuleQuickAccess, DailyOverview, QuickActions } from "@/components/space-landing";
import { Package, UtensilsCrossed, CalendarDays, ShoppingCart, Plus, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Nutrition Space",
};

async function fetchNutritionData(userId: string) {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;

  const [dishCount, shoppingItems, weekPlan] = await Promise.all([
    prisma.dish.count({ where: { userId } }),
    prisma.shoppingListItem.count({ where: { shoppingList: { userId }, checked: false } }),
    prisma.weekPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ])

  let mealsToday = 0
  if (weekPlan) {
    const dayPlan = await prisma.dayPlan.findFirst({
      where: { weekPlanId: weekPlan.id, dayOfWeek },
      include: {
        mealSlots: {
          include: {
            dishEntries: true,
          },
        },
      },
    })
    if (dayPlan) {
      mealsToday = dayPlan.mealSlots.reduce((sum, slot) => sum + slot.dishEntries.length, 0)
    }
  }

  return { mealsToday, dishCount, shoppingItems, weekPlan };
}

export default async function NutritionSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  let nutritionData: Awaited<ReturnType<typeof fetchNutritionData>> | null = null;
  let error: Error | null = null;

  try {
    nutritionData = await fetchNutritionData(userId);
  } catch (e) {
    console.error("[NutritionSpace] Failed to load:", e);
    error = e instanceof Error ? e : new Error(String(e));
  }

  const modules = [
    {
      title: "Products",
      href: "/nutrition/products",
      description: "Inventories, macro-data, and source tracking.",
      icon: Package,
      status: "Active",
    },
    {
      title: "Dishes",
      href: "/nutrition/dishes",
      description: "Recipe repository with automated macro scaling.",
      icon: UtensilsCrossed,
      status: "Active",
    },
    {
      title: "Plans",
      href: "/nutrition/plans",
      description: "Daily & Weekly schedules with calorie targets.",
      icon: CalendarDays,
      status: "Active",
    },
    {
      title: "Shopping",
      href: "/nutrition/shopping",
      description: "Smart aggregation of ingredients for procurement.",
      icon: ShoppingCart,
      status: "Active",
    },
  ];

  if (error) {
    return (
      <SpaceLanding
        header={{
          label: "nutrition space",
          title: "Nutrition Space",
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

  const d = nutritionData!;
  const weekName = d.weekPlan?.name || "No active plan";

  return (
    <SpaceLanding
      header={{
        label: "nutrition space",
        title: "Nutrition Space",
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
          { label: "Meals Planned", value: d.mealsToday.toString(), icon: UtensilsCrossed },
          { label: "Active Plan", value: weekName, icon: CalendarDays },
          { label: "Shopping Items", value: d.shoppingItems.toString(), icon: ShoppingCart },
          { label: "Recipes", value: d.dishCount.toString(), icon: Package },
        ]}
      />
      <QuickActions
        actions={[
          {
            label: "Create Plan",
            href: "/nutrition/plans",
            icon: CalendarDays,
            variant: "primary",
          },
          {
            label: "Add Product",
            href: "/nutrition/products",
            icon: Plus,
            variant: "secondary",
          },
          {
            label: "Shopping List",
            href: "/nutrition/shopping",
            icon: FileText,
            variant: "secondary",
          },
        ]}
      />
      <ModuleQuickAccess modules={modules} />
    </SpaceLanding>
  );
}
