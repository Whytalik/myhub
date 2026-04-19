import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { ProductTable } from "@/features/food/components/ProductTable";
import { getProducts } from "@/features/food/services/product-service";
import { Edit3 } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Products",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
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
      <Breadcrumb items={[{ label: "food", href: "/food" }, { label: "products" }]} />
      <div className="flex justify-between items-start mb-4">
        <Heading title="Products" className="text-5xl" />
        <div className="flex gap-2">
          <Link
            href={isEditMode ? "/food/products" : "/food/products?edit=true"}
            className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] border transition-all ${
              isEditMode 
                ? "bg-accent/10 border-accent text-accent" 
                : "bg-raised border-border hover:border-accent/50 text-secondary hover:text-text"
            }`}
          >
            <Edit3 size={14} />
            {isEditMode ? "Exit Edit" : "Edit Mode"}
          </Link>
          <Link 
            href="/food/products?create=true"
            className="bg-raised border border-border px-4 py-2 rounded text-[10px] font-mono uppercase tracking-[0.2em] hover:border-accent/50 transition-colors"
          >
            Add New
          </Link>
        </div>
      </div>

      <ProductTable initialProducts={products} isEditModeExternal={isEditMode} />
    </div>
  );
}
