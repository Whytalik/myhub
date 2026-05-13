import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  SpaceLanding, 
  SpaceDescription, 
  SpaceNavTile, 
  SpaceIntelligence 
} from "@/components/space-landing";
import { Utensils, Dumbbell, Activity, Heart, Apple } from "lucide-react";

export const metadata: Metadata = {
  title: "Health Domain | Personal OS",
};

export default async function HealthPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "health",
        title: "Health",
        description: "Physical foundation of performance. Optimizing the human hardware.",
      }}
    >
      <SpaceDescription
        problem="Physical performance degrades without intentional management of fuel, movement, and recovery."
        solution="A dual-engine system tracking biochemical input (Nutrition) and mechanical output (Fitness)."
        result="High-baseline energy, optimized body composition, and long-term vitality."
      />

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={16} className="text-domain-health" />
          <h2 className="text-micro font-bold uppercase tracking-widest text-text-muted">Bio-Management</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpaceNavTile
            variant="primary"
            title="Nutrition Space"
            description="Intelligent meal planning, macro tracking, and recipe library."
            href="/nutrition"
            icon={Utensils}
            stats="Goal: 2800 kcal / day"
            className="md:col-span-2"
          />
          <SpaceNavTile
            title="Fitness Space"
            description="Workout programming, strength progress, and biometric tracking."
            href="/fitness"
            icon={Dumbbell}
            stats="Next: Upper Body A"
          />
          <SpaceNavTile
            title="Recovery"
            description="Sleep quality, HRV, and stress management protocols."
            href="/health/recovery"
            icon={Heart}
          />
          <SpaceNavTile
            title="Supplements"
            description="Stack optimization and schedule."
            href="/health/supplements"
            icon={Apple}
          />
        </div>
      </div>

      <SpaceIntelligence
        title="Biometric Telemetry"
        items={[
          { label: "Daily Kcal", value: "2,450" },
          { label: "Weight", value: "82.4 kg" },
          { label: "Sleep Score", value: "88" },
          { label: "Recovery", value: "Optimal" },
          { label: "Activity", value: "High" },
        ]}
      />
    </SpaceLanding>
  );
}
