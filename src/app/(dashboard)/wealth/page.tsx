import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
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
        title: "Wealth",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Financial decisions made without data lead to missed opportunities and unmanaged risk."
        solution="Trade journaling, portfolio tracking, and performance analytics."
        result="Informed decisions and measurable growth."
      />
      <SpaceNav
        items={[
          {
            title: "Trading Space",
            description: "Trade journal & portfolio",
            href: "/trading",
            icon: TrendingUp,
          },
        ]}
      />
    </SpaceLanding>
  );
}
