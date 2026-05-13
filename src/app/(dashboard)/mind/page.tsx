import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  SpaceLanding, 
  SpaceDescription, 
  SpaceNavTile, 
  SpaceIntelligence 
} from "@/components/space-landing";
import { Languages, BookOpen, Brain, Lightbulb, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Mind Domain | Personal OS",
};

export default async function MindPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SpaceLanding
      header={{
        label: "mind",
        title: "Mind",
        description: "Intellectual growth and knowledge management. Upgrading the mental firmware.",
      }}
    >
      <SpaceDescription
        problem="Information overload without structured retention leads to forgotten knowledge and wasted effort."
        solution="A knowledge-management architecture based on active recall, immersion, and curated consumption."
        result="Active mastery and a compound interest of knowledge over time."
      />

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Brain size={16} className="text-domain-mind" />
          <h2 className="text-micro font-bold uppercase tracking-widest text-text-muted">Cognitive Hub</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpaceNavTile
            variant="primary"
            title="Library Space"
            description="Manage your books, articles, and research papers. Tracking reading progress."
            href="/library"
            icon={BookOpen}
            stats="3 books active"
            className="md:col-span-2"
          />
          <SpaceNavTile
            title="Language Space"
            description="Spaced repetition, immersion tracking, and vocabulary mastery."
            href="/languages"
            icon={Languages}
            stats="Spanish: 128 day streak"
          />
          <SpaceNavTile
            title="Knowledge Base"
            description="Second brain and interconnected notes."
            href="/mind/knowledge"
            icon={Lightbulb}
          />
          <SpaceNavTile
            title="Courses"
            description="Active learning and certifications."
            href="/mind/courses"
            icon={GraduationCap}
          />
        </div>
      </div>

      <SpaceIntelligence
        title="Intellectual Telemetry"
        items={[
          { label: "Daily Reading", value: "42 min" },
          { label: "New Cards", value: "25" },
          { label: "Books / Year", value: "12 / 24" },
          { label: "Retention", value: "89%" },
          { label: "Focus State", value: "Stable" },
        ]}
      />
    </SpaceLanding>
  );
}
