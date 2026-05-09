import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Wealth Domain",
};

export default async function WealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "wealth",
        title: "Assets & Value",
        description: "The Wealth domain manages financial resources and investment strategy. Optimize capital flow, manage risk, and track long-term equity growth.",
      }}
      intelligence={{
        items: [
          { label: "Portfolio Health", value: "Balanced" },
          { label: "Capital Flow", value: "Positive" },
          { label: "Risk Index", value: "Low" },
        ],
      }}
    >
      <ModuleQuickAccess
        modules={[
          {
            title: "Trading Space",
            href: "/trading",
            description: "Live market telemetry, trade journaling, and portfolio allocation.",
            icon: TrendingUp,
            status: "Coming soon",
          },
        ]}
      />
    </SpaceLanding>
  );
}
