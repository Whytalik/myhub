import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DomainTemplate } from "@/components/domain-template";
import { TrendingUp, Database } from "lucide-react";

export default async function WealthPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/home");

  return (
    <DomainTemplate
      domainId="wealth"
      title="Assets & Value"
      subtitle="Capital Allocation"
      description="The Wealth domain manages financial resources and investment strategy. Optimize capital flow, manage risk, and track long-term equity growth."
      icon={Database}
      color="#22c55e"
      spaces={[
        { label: "Trading Space", description: "Live market telemetry, trade journaling, and portfolio allocation.", icon: TrendingUp, href: "/trading", color: "#22c55e", status: "disabled" },
      ]}
      metrics={[
        { label: "Portfolio Health", value: "Balanced" },
        { label: "Capital Flow", value: "Positive" },
        { label: "Risk Index", value: "Low" },
      ]}
    />
  );
}
