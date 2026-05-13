import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  SpaceLanding, 
  SpaceDescription, 
  SpaceNavTile, 
  SpaceIntelligence 
} from "@/components/space-landing";
import { ShoppingBag, Archive, Settings, ShieldCheck, Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Vault | Personal OS",
};

export default async function VaultPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "vault",
        title: "Vault",
        description: "System archives, desires, and low-frequency utilities. The long-term memory.",
      }}
    >
      <SpaceDescription
        problem="Desires and utilities scattered across disconnected tools create friction and forgotten intentions."
        solution="A centralized repository for cold storage, standalone utilities, and future intentions."
        result="Systemic order and elimination of cognitive leak."
      />

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Database size={16} className="text-domain-vault" />
          <h2 className="text-micro font-bold uppercase tracking-widest text-text-muted">Storage & Utils</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpaceNavTile
            variant="primary"
            title="Wishlist Space"
            description="Manage desires, planned purchases, and gift ideas. Prioritizing resource allocation."
            href="/other"
            icon={ShoppingBag}
            stats="12 items pending"
            className="md:col-span-2"
          />
          <SpaceNavTile
            title="Archives"
            description="Historical snapshots, completed projects, and old logs."
            href="/vault/archives"
            icon={Archive}
            stats="2.4 GB used"
          />
          <SpaceNavTile
            title="Security"
            description="Identity management, backup keys, and privacy protocols."
            href="/vault/security"
            icon={ShieldCheck}
          />
          <SpaceNavTile
            title="System Config"
            description="Deep system settings and core preferences."
            href="/vault/config"
            icon={Settings}
          />
        </div>
      </div>

      <SpaceIntelligence
        title="System Telemetry"
        items={[
          { label: "Storage", value: "84%" },
          { label: "Backups", value: "Daily" },
          { label: "Encryption", value: "AES-256" },
          { label: "Uptime", value: "99.9%" },
          { label: "Integrity", value: "Verified" },
        ]}
      />
    </SpaceLanding>
  );
}
