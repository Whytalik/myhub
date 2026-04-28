import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { DishTable } from "@/features/food/components/DishTable";
import { CreateDishForm } from "@/features/food/components/CreateDishForm";
import { getDishes } from "@/features/food/services/dish-service";
import { getProducts } from "@/features/food/services/product-service";
import { Plus, X } from "lucide-react";

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
  
  const dishes = await getDishes(userId);
  const products = isCreating ? await getProducts() : [];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food space", href: "/food" }, { label: "dishes" }]} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title={isCreating ? "New Dish" : "Dishes"} />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Recipe repository with automated macro scaling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isCreating ? (
            <Link href="/food/dishes">
              <Button variant="outline" size="sm" className="rounded-xl">
                <X size={14} className="mr-1.5" />
                Cancel
              </Button>
            </Link>
          ) : (
            <Link href="/food/dishes?create=true">
              <Button variant="primary" size="sm" className="rounded-xl px-5">
                <Plus size={16} className="mr-1.5" />
                New Dish
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {isCreating ? (
          <CreateDishForm 
            userId={userId} 
            products={products} 
          />
        ) : (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <DishTable initialDishes={dishes} />
          </div>
        )}
      </div>
    </div>
  );
}
