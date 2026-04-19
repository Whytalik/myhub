import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { DishTable } from "@/features/food/components/DishTable";
import { CreateDishForm } from "@/features/food/components/CreateDishForm";
import { getDishes } from "@/features/food/services/dish-service";
import { getProducts } from "@/features/food/services/product-service";
import { X } from "lucide-react";

export const metadata: Metadata = {
  title: "Dishes",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const personId = (session?.user as any)?.personId;

  if (!session || !personId) {
    redirect("/login");
  }

  const params = await searchParams;
  const isCreating = params.create === "true";
  
  const dishes = await getDishes(personId);
  const products = isCreating ? await getProducts() : [];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food", href: "/food" }, { label: "dishes" }]} />
      
      <div className="flex justify-between items-start mb-8">
        <Heading title={isCreating ? "New Dish" : "Dishes"} />
        {isCreating ? (
          <Link 
            href="/food/dishes"
            className="flex items-center gap-2 bg-raised border border-border px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] hover:text-text transition-colors"
          >
            <X size={14} /> Cancel
          </Link>
        ) : (
          <Link 
            href="/food/dishes?create=true"
            className="flex items-center gap-2 bg-accent text-bg border border-accent px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] font-bold hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(224,155,47,0.2)]"
          >
            Create Dish
          </Link>
        )}
      </div>

      {isCreating ? (
        <CreateDishForm 
          personId={personId} 
          products={products} 
        />
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <DishTable initialDishes={dishes} />
        </div>
      )}
    </div>
  );
}
