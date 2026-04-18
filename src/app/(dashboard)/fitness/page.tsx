import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Dumbbell, Activity, TrendingUp, Flame, Target, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Fitness System",
};

export default function FitnessPage() {
  const sections = [
    {
      title: "Workouts",
      href: "/fitness/workouts",
      description: "Log and plan training sessions across strength, cardio, and mobility.",
      icon: Dumbbell,
      status: "Coming soon",
    },
    {
      title: "Exercises",
      href: "/fitness/exercises",
      description: "Personal exercise library with sets, reps, and technique notes.",
      icon: Activity,
      status: "Coming soon",
    },
    {
      title: "Progress",
      href: "/fitness/progress",
      description: "Track volume, personal records, and body metrics over time.",
      icon: TrendingUp,
      status: "Coming soon",
    },
  ];

  const principles = [
    {
      step: "01",
      name: "Overload",
      desc: "Progressively increase intensity to force adaptation and growth.",
      icon: Flame,
    },
    {
      step: "02",
      name: "Consistency",
      desc: "Show up on schedule. Frequency beats occasional intensity every time.",
      icon: Target,
    },
    {
      step: "03",
      name: "Recover",
      desc: "Sleep, nutrition, and rest are training — not breaks from it.",
      icon: RefreshCw,
    },
  ];

  return (
    <div className="px-6 sm:px-14 py-10">
      <Breadcrumb items={[{ label: "fitness system" }]} />

      <div className="flex flex-col mb-16">
        <Heading title="Fitness System" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Your physical training system. Build strength, track progress, and structure
          workouts around the principles that actually produce long-term results.
        </p>
      </div>

      {/* Principles */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">
            Training Principles
          </h4>
          <div className="h-px flex-1 bg-border/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {principles.map((p, i) => (
            <div key={p.step} className="relative group">
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-border group-hover:text-accent/20 transition-colors duration-500">
                  {p.step}
                </span>
                <div className="flex items-center gap-2">
                  <p.icon size={14} className="text-accent/60" />
                  <h5 className="font-mono text-[11px] text-text uppercase tracking-widest">
                    {p.name}
                  </h5>
                </div>
                <p className="text-secondary text-xs leading-relaxed pr-4">{p.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-border">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {sections.map((section) => (
          <div
            key={section.href}
            className="group relative bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="font-heading text-8xl uppercase leading-none tracking-tighter -mr-8">
                {section.title}
              </span>
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-4xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                    {section.title}
                  </h3>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                    {section.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-accent group-hover:scale-110 transition-transform">
                  <section.icon size={22} />
                </div>
              </div>
              <p className="text-secondary text-xs leading-relaxed mb-8">{section.description}</p>
              <Link href={section.href} className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors">
                <span>Enter Space</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
