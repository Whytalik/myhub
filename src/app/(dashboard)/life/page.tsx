import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { BookText, CheckCircle2, Zap, Brain, Target, TrendingUp, History, LayoutDashboard, Info, Settings2 } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Life Space",
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
      desc: "Use Stats to spot patterns and adjust your habits and task logic accordingly.",
      icon: Target
    }
  ];

  const dashboardContent = (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
                  <span>Enter Space</span>
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

  const systemContent = (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl">
      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Settings2 size={18} className="text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-tight">System Logic & Rules</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <h4 className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">Daily Closure</h4>
<p className="text-sm text-secondary leading-relaxed">
                 The day is considered &ldquo;Complete&rdquo; only after the Evening Reflection is filled. 
                 Unfinished tasks are automatically prompted for migration or elimination the next morning.
               </p>
            </div>
            <div className="bg-surface border border-border p-6 rounded-2xl">
              <h4 className="font-mono text-[10px] text-accent uppercase tracking-widest mb-3">Habit Gravity</h4>
<p className="text-sm text-secondary leading-relaxed">
                 Missing a habit twice is a trend; missing it once is a mistake. 
                 The system highlights &ldquo;Recovery&rdquo; when a streak is broken to focus on immediate resumption.
               </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <Info size={18} className="text-accent" />
            <h3 className="text-xl font-bold uppercase tracking-tight">Principles of the Space</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center shrink-0 text-accent font-mono text-[10px]">1</div>
              <div>
                <p className="text-sm font-bold mb-1 uppercase tracking-tight">Awareness First</p>
                <p className="text-xs text-secondary leading-relaxed">The goal of the journal is not just record-keeping, but active awareness of energy and mood triggers.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center shrink-0 text-accent font-mono text-[10px]">2</div>
              <div>
                <p className="text-sm font-bold mb-1 uppercase tracking-tight">Radical Elimination</p>
                <p className="text-xs text-secondary leading-relaxed">If a task has been moved 3 times without action, it must be eliminated or moved to a &ldquo;Someday&rdquo; list. No ghost tasks.</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life space" }]} />

      <div className="flex flex-col mb-16">
        <Heading title="Life Space" />

        <p className="text-secondary max-w-2xl leading-relaxed">
          Your personal cognitive environment. Manage your mental clarity, 
          track consistency, and build the discipline required for your ultimate goals.
        </p>
      </div>

      <Tabs 
        tabs={[
          { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} />, content: dashboardContent },
          { id: "system", label: "System Guide", icon: <Info size={14} />, content: systemContent },
        ]} 
      />
    </div>
  );
}
