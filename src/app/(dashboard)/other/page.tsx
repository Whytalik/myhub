import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { Target } from "lucide-react";

export const metadata: Metadata = {
  title: "Misc / Other",
};

export default async function OtherSpacePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "misc / other",
        title: "Misc / Other",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Standalone tools and wishlists scattered across apps create friction."
        solution="Centralized wishlist and utility tools in one place."
        result="Quick access to everything that doesn't fit elsewhere."
      />
      <SpaceNav
        items={[
          {
            title: "Wishlist",
            description: "Desires & planned purchases",
            href: "/other/wishlist",
            icon: Target,
          },
        ]}
      />
    </SpaceLanding>
  );
}
