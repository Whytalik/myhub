import type { Metadata } from "next";
import { SpaceLanding, ModuleQuickAccess } from "@/components/space-landing";
import { Dumbbell, Activity, TrendingUp, Flame, Target, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Fitness Space",
};

export default function FitnessPage() {
  const modules = [
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

  return (
    <SpaceLanding
      header={{
        label: "fitness space",
        title: "Fitness Space",
        description: "Your physical training space. Build strength, track progress, and structure workouts around the principles that actually produce long-term results.",
      }}
      intelligence={{
        items: [
          { label: "Core Principle", value: "Progressive Overload" },
          { label: "Key Driver", value: "Consistency" },
          { label: "Recovery", value: "Sleep + Nutrition" },
          { label: "Status", value: "Initializing" },
        ],
      }}
    >
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Training Principles</h4>
          <div className="h-px flex-1 bg-border/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", name: "Overload", desc: "Progressively increase intensity to force adaptation and growth.", icon: Flame },
            { step: "02", name: "Consistency", desc: "Show up on schedule. Frequency beats occasional intensity every time.", icon: Target },
            { step: "03", name: "Recover", desc: "Sleep, nutrition, and rest are training — not breaks from it.", icon: RefreshCw },
          ].map((p, i) => (
            <div key={p.step} className="relative group">
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-border group-hover:text-accent/20 transition-colors duration-500">
                  {p.step}
                </span>
                <div className="flex items-center gap-2">
                  <p.icon size={14} className="text-accent/60" />
                  <h5 className="font-mono text-[11px] text-text uppercase tracking-widest">{p.name}</h5>
                </div>
                <p className="text-secondary text-xs leading-relaxed pr-4">{p.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-border">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ModuleQuickAccess modules={modules} />
    </SpaceLanding>
  );
}
