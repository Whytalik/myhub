import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
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
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "nutrition space", href: "/nutrition" }, { label: "products" }]}
        title="Products"
        description="Personal product database with macros and pricing."
      />

      <div className="animate-in fade-in duration-500">
        <ProductLibrary initialProducts={products} />
      </div>
    </div>
  );
}
