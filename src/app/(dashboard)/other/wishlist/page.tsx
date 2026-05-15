import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { WishlistPageClient } from "./WishlistPageClient";
import { wishlistService } from "@/features/other/wishlist/services/wishlist-service";

export const metadata: Metadata = {
  title: "Wishlist | Misc / Other",
};

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!session || !userId) redirect("/login");

  const items = await wishlistService.getAll(userId);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[
          { label: "misc / other", href: "/other" },
          { label: "wishlist" }
        ]}
        title="Wishlist"
        description="Manage your desires and planned purchases. Track prices, priorities, and transform your wishes into reality."
      />
      
      <WishlistPageClient items={items} />
    </div>
  );
}
