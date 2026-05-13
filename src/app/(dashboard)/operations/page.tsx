import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  SpaceLanding, 
  SpaceDescription, 
  SpaceNavTile, 
  SpaceIntelligence 
} from "@/components/space-landing";
import { Compass, Sparkles, Zap, Target, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Operations Domain | Personal OS",
};

export default async function OperationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "operations",
        title: "Operations",
        description: "The engine of your Personal OS. Systematizing direction and execution.",
      }}
    >
      {/* 1. The Thesis Block */}
      <SpaceDescription
        problem="Vision without execution is just dreaming. Most systems fail at the bridge between high-level strategy and messy daily action."
        solution="A strict 5-level hierarchy powered by 12-week cycles, ensuring every task is anchored to a North Star."
        result="Radical clarity and consistent, measurable momentum."
      />

      {/* 2. Bento Navigation Grid */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={16} className="text-accent" />
          <h2 className="text-micro font-bold uppercase tracking-widest text-text-muted">Control Centers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Space (Bigger) */}
          <SpaceNavTile
            variant="primary"
            title="Planning Space"
            description="Align your vision with quarterly cycles and active sprints."
            href="/planning"
            icon={Target}
            stats="Sprint 4: 12 days left"
            className="md:col-span-2"
          />
          
          {/* Secondary Space */}
          <SpaceNavTile
            title="Life Space"
            description="The daily rhythm: Journal, habits, and task execution."
            href="/life"
            icon={Sparkles}
            stats="8 pending tasks"
          />

          {/* Quick Access Tiles */}
          <SpaceNavTile
             title="Protocols"
             description="Standard operating procedures for your life."
             href="/operations/protocols"
             icon={BookOpen}
          />
          <SpaceNavTile
             title="System Logs"
             description="Audit trails and historical performance data."
             href="/operations/logs"
             icon={Compass}
          />
          <SpaceNavTile
             title="Archives"
             description="Cold storage for completed cycles."
             href="/operations/archives"
             icon={Zap}
          />
        </div>
      </div>

      {/* 3. Global Intelligence */}
      <SpaceIntelligence
        title="Operations Telemetry"
        items={[
          { label: "Active Sprint", value: "Q2-S4" },
          { label: "Task Velocity", value: "84%" },
          { label: "Cycle Day", value: "18 / 84" },
          { label: "Habit Score", value: "9.2" },
          { label: "System Load", value: "Nominal" },
        ]}
      />
    </SpaceLanding>
  );
}
