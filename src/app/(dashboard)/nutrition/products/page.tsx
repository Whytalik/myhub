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
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumb items={[{ label: "nutrition space", href: "/nutrition" }, { label: "products" }]} />
        <Heading title="Products" />
        <div className="h-px w-full bg-border-dim mt-4 mb-3" />
        <p className="text-body text-text-secondary">Personal product database with macros and pricing.</p>
      </div>

      <div className="animate-in fade-in duration-500">
        <ProductLibrary initialProducts={products} />
      </div>
    </div>
  );
}
