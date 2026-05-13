import type { Metadata } from "next";
import { SpaceLanding, SpaceDescription, SpaceNav } from "@/components/space-landing";
import { BookText, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Trading Space",
};

export default function TradingPage() {
  return (
    <SpaceLanding
      header={{
        label: "trading space",
        title: "Trading Space",
        description: "",
      }}
    >
      <SpaceDescription
        problem="Trading without journaling repeats mistakes and hides patterns."
        solution="Trade log with entry/exit tracking, performance analytics, and portfolio overview."
        result="Data-driven decisions and continuous improvement."
      />
      <SpaceNav
        items={[
          {
            title: "Trade Log",
            description: "Entry & exit tracking",
            href: "/trading/journal",
            icon: BookText,
          },
          {
            title: "Portfolio",
            description: "Holdings overview",
            href: "/trading/portfolio",
            icon: Package,
          },
        ]}
      />
    </SpaceLanding>
  );
}
