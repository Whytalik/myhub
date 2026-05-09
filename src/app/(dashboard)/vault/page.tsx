import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
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
        title: "Storage & Utility",
        description: "The Vault domain is your secondary storage. It houses desires, low-frequency tools, and general system utilities.",
      }}
      intelligence={{
        items: [
          { label: "System Integrity", value: "Secure" },
          { label: "Unit Capacity", value: "42" },
          { label: "Archive Size", value: "1.2GB" },
        ],
      }}
    >
      <ModuleQuickAccess
        modules={[
          {
            title: "Misc / Other",
            href: "/other",
            description: "Wishlist, standalone tools, and system archives.",
            icon: ShoppingBag,
            status: "Active",
          },
        ]}
      />
    </SpaceLanding>
  );
}
