import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { BookText, CheckCircle2, Zap, Brain, Target, TrendingUp, History } from "lucide-react";

export const metadata: Metadata = {
  title: "Life System",
};

export default function LifeSystemPage() {
  const sections = [
    {
      title: "Journal",
      href: "/life/journal",
      description: "Morning & evening routines, sleep, energy & mood, nutrition, emotions, and daily reflection — all in one daily log.",
      icon: BookText,
      status: "Active",
      sub: "History →",
      subHref: "/life/history",
    },
    {
      title: "Tasks",
      href: "/life/tasks",
      description: "Hierarchical task management organized by life spheres. Gallery and calendar views.",
      icon: CheckCircle2,
      status: "Active",
      sub: null,
      subHref: null,
    },
    {
      title: "Habits",
      href: "/life/habits",
      description: "Daily discipline tracker with today's practice check-ins and success analytics.",
      icon: Zap,
      status: "Active",
      sub: null,
      subHref: null,
    },
    {
      title: "Stats",
      href: "/life/journal/stats",
      description: "Visual analytics of journal consistency, task completion, and routine adherence.",
      icon: TrendingUp,
      status: "Active",
      sub: null,
      subHref: null,
    },
  ];

  const philosophy = [
    {
      step: "01",
      name: "Track",
      desc: "Log your daily energy, sleep, mood, routines, and tasks in the journal.",
      icon: Zap
    },
    {
      step: "02",
      name: "Reflect",
      desc: "End each day with a structured review — wins, gratitude, brain dump, and tomorrow's intention.",
      icon: Brain
    },
    {
      step: "03",
      name: "Improve",
      desc: "Use Stats to spot patterns and adjust your habits and task system accordingly.",
      icon: Target
    }
  ];

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life system" }]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Life System" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Your personal cognitive environment. Manage your mental clarity, 
          track consistency, and build the discipline required for your ultimate goals.
        </p>
      </div>

      {/* Philosophy / Process Section */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Growth Engine</h4>
          <div className="h-px flex-1 bg-border/30" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {philosophy.map((p, i) => (
            <div key={p.step} className="relative group">
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-border group-hover:text-accent/20 transition-colors duration-500">
                  {p.step}
                </span>
                <div className="flex items-center gap-2">
                  <p.icon size={14} className="text-accent/60" />
                  <h5 className="font-mono text-[11px] text-text uppercase tracking-widest">{p.name}</h5>
                </div>
                <p className="text-secondary text-xs leading-relaxed pr-4">
                  {p.desc}
                </p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] text-border">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
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
                  <h3 className="font-heading text-5xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                    {section.title}
                  </h3>
                  <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                    {section.status}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-accent group-hover:scale-110 transition-transform">
                  <section.icon size={24} />
                </div>
              </div>
              <p className="text-secondary text-sm leading-relaxed mb-8 max-w-[80%]">
                {section.description}
              </p>
              <div className="flex items-center justify-between">
                <Link
                  href={section.href}
                  className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors"
                >
                  <span>Enter System</span>
                  <span>→</span>
                </Link>
                {section.subHref && (
                  <Link
                    href={section.subHref}
                    className="flex items-center gap-1.5 text-[10px] font-mono text-muted hover:text-accent transition-colors"
                  >
                    <History size={11} />
                    {section.sub}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Motivation Area */}
      <div className="bg-surface/50 border border-border-dim rounded-2xl p-10 flex flex-col items-center text-center gap-6">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
           <Zap size={20} className="text-accent animate-pulse" />
        </div>
        <blockquote className="max-w-2xl">
          <p className="text-lg text-text font-light leading-relaxed italic">
            &ldquo;You do not rise to the level of your goals. You fall to the level of your systems.&rdquo;
          </p>
          <footer className="mt-4 text-[10px] font-mono text-muted uppercase tracking-[0.3em]">
            — James Clear, Atomic Habits
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
