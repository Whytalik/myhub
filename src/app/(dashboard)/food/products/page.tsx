import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/features/food/components/ProductTable";
import { getProducts } from "@/features/food/services/product-service";
import { Edit3, Plus } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Food Products",
};

export default async function FoodProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const products = await getProducts();
  const params = await searchParams;
  const isEditMode = params.edit === "true";

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "food space", href: "/food" }, { label: "products" }]} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title="Products" />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Ingredient database with nutrition data and smart import.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={isEditMode ? "/food/products" : "/food/products?edit=true"}
          >
            <Button
              variant={isEditMode ? "primary" : "outline"}
              size="sm"
              className="rounded-xl"
            >
              <Edit3 size={14} className="mr-1.5" />
              {isEditMode ? "Exit Edit" : "Edit Mode"}
            </Button>
          </Link>
          <Link href="/food/products?create=true">
            <Button variant="outline" size="sm" className="rounded-xl">
              <Plus size={14} className="mr-1.5" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <ProductTable initialProducts={products} isEditModeExternal={isEditMode} />
      </div>
    </div>
  );
}
