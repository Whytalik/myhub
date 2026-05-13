import type { Metadata } from "next";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Fitness Space",
};

export default function FitnessPage() {
  return (
    <SpaceLanding
      header={{
        label: "fitness space",
        title: "Fitness Space",
        description: "",
      }}
    />
  );
}
