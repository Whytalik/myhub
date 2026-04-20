import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DomainTemplate } from "@/components/domain-template";
import { Utensils, Dumbbell, Shield } from "lucide-react";

export default async function HealthPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/home");

  return (
    <DomainTemplate
      domainId="health"
      title="Fuel & Power"
      subtitle="Physical Optimization"
      description="The Health domain manages the physiological foundation of your performance. From metabolic precision to muscular adaptation, everything is quantified."
      icon={Shield}
      color="#ff8c00"
      spaces={[
        { label: "Food Space", description: "Precision nutrition, macro tracking, and meal architecture.", icon: Utensils, href: "/food", color: "#ff8c00" },
        { label: "Fitness Space", description: "High-performance training, progressive overload, and volume tracking.", icon: Dumbbell, href: "/fitness", color: "#e87d88" },
      ]}
      metrics={[
        { label: "Metabolic Status", value: "Optimized" },
        { label: "Training Load", value: "Active" },
        { label: "Integrity", value: "98%" },
      ]}
    />
  );
}
