import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
import { Target, Package } from "lucide-react";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Misc / Other",
};

async function fetchWishlistCount(userId: string) {
  return prisma.wishlistItem.count({ where: { userId } });
}

function WishlistCountSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-20">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}

async function WishlistCount({ userId }: { userId: string }) {
  const count = await fetchWishlistCount(userId);
  return (
    <div className="bg-surface border border-border rounded-xl p-6 mb-20">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Wishlist</h4>
        <span className="text-2xl font-heading text-text">{count} items</span>
      </div>
    </div>
  );
}

export default async function OtherSpacePage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/life");

  const modules = [
    {
      title: "Wishlist",
      href: "/other/wishlist",
      description: "Manage your desires, planned purchases, and long-term goals.",
      icon: Target,
      status: "Active",
    },
  ];

  return (
    <SpaceLanding
      header={{
        label: "misc / other",
        title: "Misc / Other",
        description: "A collection of independent tools and trackers that don't fit into the main spaces.",
      }}
    >
      <Suspense fallback={<WishlistCountSkeleton />}>
        <WishlistCount userId={session!.user!.id} />
      </Suspense>
      <ModuleQuickAccess modules={modules} />
      <div className="bg-surface/50 border border-border-dim border-dashed rounded-2xl p-10 flex flex-col items-center text-center gap-4 opacity-60">
        <Package size={24} className="text-muted" />
        <p className="text-sm text-secondary">More standalone tools will appear here in the future.</p>
      </div>
    </SpaceLanding>
  );
}
