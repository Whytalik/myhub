import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = {
  title: "Vault",
};

export default async function VaultPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "vault",
        title: "Vault",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Desires and utilities scattered across tools create friction and forgotten intentions."
        solution="Centralized wishlist, standalone tools, and system archives."
        result="Nothing falls through the cracks."
      />
      <SpaceNav
        items={[
          {
            title: "Misc / Other",
            description: "Wishlist & tools",
            href: "/other",
            icon: ShoppingBag,
          },
        ]}
      />
    </SpaceLanding>
  );
}
