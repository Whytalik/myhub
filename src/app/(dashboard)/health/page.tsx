import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
import { Utensils, Dumbbell } from "lucide-react";

export const metadata: Metadata = {
  title: "Health Domain",
};

export default async function HealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "health",
        title: "Fuel & Power",
        description: "The Health domain manages the physiological foundation of your performance. From metabolic precision to muscular adaptation, everything is quantified.",
      }}
      intelligence={{
        items: [
          { label: "Metabolic Status", value: "Optimized" },
          { label: "Training Load", value: "Active" },
          { label: "Integrity", value: "98%" },
        ],
      }}
    >
      <ModuleQuickAccess
        modules={[
          {
            title: "Nutrition Space",
            href: "/nutrition",
            description: "Precision nutrition, macro tracking, and meal architecture.",
            icon: Utensils,
            status: "In Dev",
          },
          {
            title: "Fitness Space",
            href: "/fitness",
            description: "High-performance training, progressive overload, and volume tracking.",
            icon: Dumbbell,
            status: "Coming soon",
          },
        ]}
      />
    </SpaceLanding>
  );
}
