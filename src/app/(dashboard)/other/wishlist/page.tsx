import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { WishlistPageClient } from "./WishlistPageClient";
import { wishlistService } from "@/features/other/wishlist/services/wishlist-service";

export const metadata: Metadata = {
  title: "Wishlist | Misc / Other",
};

export default async function WishlistPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!session || !userId) redirect("/login");
  if (session?.user?.role !== "ADMIN") redirect("/life");

  const items = await wishlistService.getAll(userId);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb 
        items={[
          { label: "misc / other", href: "/other" },
          { label: "wishlist" }
        ]} 
      />
      
      <div className="flex justify-between items-end mb-16">
        <div className="flex flex-col">
          <Heading title="Wishlist" />
          <p className="text-secondary max-w-2xl leading-relaxed">
            Manage your desires and planned purchases. Track prices, priorities, 
            and transform your wishes into reality.
          </p>
        </div>
      </div>
      
      <WishlistPageClient items={items} />
    </div>
  );
}
