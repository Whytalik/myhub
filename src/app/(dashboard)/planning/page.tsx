import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { 
  Compass, 
  Target, 
  Zap, 
  LayoutDashboard, 
  Flag, 
  CheckCircle2,
  Brain,
  History
} from "lucide-react";

export const metadata: Metadata = {
  title: "Planning Space",
};

export default function PlanningPage() {
  const levels = [
    {
      level: "01 & 02",
      title: "Vision & Milestones",
      href: "/planning/vision",
      description: "Ultimate North Star (10-25 years) and Strategic 3-Year Milestones. The 'Why' and 'Where'.",
      icon: Target,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      level: "03",
      title: "Annual Compass",
      href: "/planning/compass",
      description: "Annual Theme and Strategic Focus for the current calendar year. The 'Flavor' of your growth.",
      icon: Compass,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      level: "04",
      title: "12-Week Sprints",
      href: "/planning/sprints",
      description: "Tactical execution engine. Quarterly Objectives and Key Results (OKRs). The 'What'.",
      icon: Zap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      level: "05",
      title: "Review Center",
      href: "/planning/reviews",
      description: "Weekly Scorecards, accountability logs, and tactical adjustments. The 'How'.",
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "planning space" }]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Planning Space" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          The alignment engine of your Personal OS. Bridge the gap between 
          your abstract dreams and daily execution using the 5-Level Structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {levels.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group relative bg-surface border border-border p-8 rounded-2xl hover:bg-raised transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Level {l.level}</span>
                <h3 className="text-2xl font-heading text-text uppercase group-hover:text-accent transition-colors">
                  {l.title}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${l.bg} ${l.color} group-hover:scale-110 transition-transform`}>
                <l.icon size={24} />
              </div>
            </div>
            <p className="text-secondary text-sm leading-relaxed mb-6">
              {l.description}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted group-hover:text-text transition-colors">
              <span>Access Level</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-20 p-10 bg-surface/50 border border-dashed border-border rounded-2xl text-center">
        <div className="max-w-md mx-auto">
          <Brain size={32} className="mx-auto text-accent/40 mb-4" />
          <h4 className="text-sm font-bold uppercase tracking-widest mb-2 text-text">System Intelligence</h4>
          <p className="text-xs text-secondary leading-relaxed">
            This space is designed to ensure that every 12-week goal has a clear lineage to your North Star. 
            If a sprint doesn't support a Milestone, the system will flag it as a distraction.
          </p>
        </div>
      </div>
    </div>
  );
}
