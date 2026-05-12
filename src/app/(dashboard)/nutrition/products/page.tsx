import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { ProductLibrary } from "@/features/nutrition/components/ProductLibrary";
import { getProducts } from "@/features/nutrition/actions/products";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const productsResult = await getProducts();
  const products = productsResult.success ? productsResult.data : [];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "products" }]} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <Heading title="Products" />
          <p className="text-note font-mono text-muted tracking-widest pl-1 italic">
            Personal product database with macros and pricing.
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <ProductLibrary initialProducts={products} />
      </div>
    </div>
  );
}
