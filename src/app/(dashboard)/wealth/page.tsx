import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  SpaceLanding, 
  SpaceDescription, 
  SpaceNavTile, 
  SpaceIntelligence 
} from "@/components/space-landing";
import { TrendingUp, Wallet, PieChart, LineChart, Coins } from "lucide-react";

export const metadata: Metadata = {
  title: "Wealth Domain | Personal OS",
};

export default async function WealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "wealth",
        title: "Wealth",
        description: "Financial resources and investment strategy. Engineering financial freedom.",
      }}
    >
      <SpaceDescription
        problem="Financial decisions made without data lead to missed opportunities and unmanaged risk."
        solution="A data-driven approach combining trade journaling, portfolio telemetry, and risk management."
        result="Strategic capital allocation and compound growth."
      />

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Coins size={16} className="text-domain-wealth" />
          <h2 className="text-micro font-bold uppercase tracking-widest text-text-muted">Capital Hub</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpaceNavTile
            variant="primary"
            title="Trading Space"
            description="Active trade journal, performance metrics, and playbook. Focus on consistency."
            href="/trading"
            icon={TrendingUp}
            stats="Win Rate: 64%"
            className="md:col-span-2"
          />
          <SpaceNavTile
            title="Portfolio"
            description="Global asset allocation, net worth tracking, and rebalancing."
            href="/wealth/portfolio"
            icon={PieChart}
            stats="+4.2% this month"
          />
          <SpaceNavTile
            title="Budgets"
            description="Cash flow management and expense tracking."
            href="/wealth/budgets"
            icon={Wallet}
          />
          <SpaceNavTile
            title="Telemetry"
            description="Market analysis and correlation matrices."
            href="/wealth/telemetry"
            icon={LineChart}
          />
        </div>
      </div>

      <SpaceIntelligence
        title="Financial Telemetry"
        items={[
          { label: "Net Worth", value: "$420.5k" },
          { label: "Monthly ROI", value: "+2.1%" },
          { label: "Savings Rate", value: "35%" },
          { label: "Risk Score", value: "Low" },
          { label: "Liquidity", value: "High" },
        ]}
      />
    </SpaceLanding>
  );
}
