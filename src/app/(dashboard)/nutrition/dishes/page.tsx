import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { DishLibrary } from "@/features/nutrition/components/DishLibrary";
import { DishBuilder } from "@/features/nutrition/components/DishBuilder";
import { getCookingMethods } from "@/features/nutrition/actions/dishes";
import { getProducts } from "@/features/nutrition/actions/products";
import { prisma } from "@/lib/prisma";
import { DishWithIngredients } from "@/features/nutrition/logic/recalculator";

export const metadata: Metadata = {
  title: "Dishes",
};

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const params = await searchParams;
  const isCreating = params.create === "true";
  const editId = typeof params.edit === "string" ? params.edit : null;

  const dishes: DishWithIngredients[] = (isCreating || editId)
    ? []
    : await prisma.dish.findMany({
        where: { userId },
        include: {
          ingredients: {
            include: {
              product: true,
              cookingMethod: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

  const editingDish = editId
    ? await prisma.dish.findUnique({
        where: { id: editId, userId },
        include: {
          ingredients: {
            include: {
              product: true,
              cookingMethod: true,
            },
          },
        },
      })
    : null;

  const productsResult = (isCreating || editId) ? await getProducts() : { success: false, data: [] };
  const methodsResult = (isCreating || editId) ? await getCookingMethods() : { success: false, data: [] };

  const products = productsResult.success ? productsResult.data : [];
  const cookingMethods = methodsResult.success ? methodsResult.data : [];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "dishes" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title={isCreating ? "New Dish" : "Dishes"} />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Recipe repository with automated macro scaling.
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {isCreating || editId ? (
          <DishBuilder
            products={products}
            cookingMethods={cookingMethods}
            initialDish={editingDish}
          />
        ) : (
          <DishLibrary
            initialDishes={dishes}
          />
        )}
      </div>
    </div>
  );
}
