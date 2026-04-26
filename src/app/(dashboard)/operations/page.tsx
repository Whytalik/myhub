import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DomainTemplate } from "@/components/domain-template";
import { Compass, Sparkles, Briefcase } from "lucide-react";

export default async function OperationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DomainTemplate
      domainId="operations"
      title="Strategy & Execution"
      subtitle="The Command Center"
      description="Operations is the engine of your Personal OS. It bridges the gap between qualitative vision and daily actions through a structured 5-level hierarchy."
      icon={Briefcase}
      color="#fbbf24"
      spaces={[
        { 
          label: "Planning Space", 
          description: "Level 1-5 Strategic Framework. North Star, Milestones, and 12-Week Cycles.", 
          icon: Compass, 
          href: "/planning",
          color: "#fbbf24",
          status: "soon"
        },
        { 
          label: "Life Space", 
          description: "Execution engine. Daily journal, habit compounding, and task management.", 
          icon: Sparkles, 
          href: "/life",
          color: "#6fbfbf",
          status: "active"
        },
      ]}
      metrics={[
        { label: "System Mission", value: "Alignment" },
        { label: "Current Cycle", value: "Q2" },
        { label: "Performance", value: "90%+" },
      ]}
    />
  );
}
