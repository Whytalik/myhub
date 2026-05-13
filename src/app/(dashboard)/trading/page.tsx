import type { Metadata } from "next";
import { SpaceLanding } from "@/components/space-landing";

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
    />
  );
}
