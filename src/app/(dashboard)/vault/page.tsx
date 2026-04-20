import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DomainTemplate } from "@/components/domain-template";
import { ShoppingBag, Package } from "lucide-react";

export default async function VaultPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DomainTemplate
      domainId="vault"
      title="Storage & Utility"
      subtitle="System Archives"
      description="The Vault domain is your secondary storage. It houses desires, low-frequency tools, and general system utilities."
      icon={Package}
      color="#a3a3a3"
      spaces={[
        { label: "Misc / Other", description: "Wishlist, standalone tools, and system archives.", icon: ShoppingBag, href: "/other", color: "#a3a3a3" },
      ]}
      metrics={[
        { label: "System Integrity", value: "Secure" },
        { label: "Unit Capacity", value: "42" },
        { label: "Archive Size", value: "1.2GB" },
      ]}
    />
  );
}
