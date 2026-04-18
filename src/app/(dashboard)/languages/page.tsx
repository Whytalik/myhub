import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { LanguageService } from "@/features/languages/services/language-service";
import { LanguageRadarChart } from "@/features/languages/components/LanguageRadarChart";
import { Plus, Trophy, Languages, ChevronRight, Brain, Target, Activity } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Language Space",
};

export default async function LanguagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const personId = (session.user as any).personId;
  if (!personId) redirect("/login");

  const userLanguages = await LanguageService.getUserLanguages(personId);
  const languagesWithStats = await Promise.all(
    userLanguages.map(async (ul) => {
      const stats = await LanguageService.getLanguageStats(personId, ul.id);
      return { ...ul, stats };
    })
  );

  const workflow = [
    {
      step: "01",
      name: "Initialization",
      desc: "Map new language environments. Define your current CEFR baseline and initialize neuro-tracking.",
      icon: Brain,
    },
    {
      step: "02",
      name: "Lexical Mapping",
      desc: "Build a high-density vocabulary using Spaced Repetition (SRS). Quality over quantity focus.",
      icon: Target,
    },
    {
      step: "03",
      name: "Neural Input",
      desc: "Log immersion hours via Reading and Listening. Focus on Comprehensible Input (i+1 logic).",
      icon: Activity,
    },
    {
      step: "04",
      name: "Active Output",
      desc: "Activate passive knowledge through Speaking and Writing modules. Balance the mastery radar.",
      icon: Trophy,
    },
  ];

  return (
    <div className="px-6 sm:px-14 py-10">
      <Breadcrumb items={[{ label: "language space" }]} />

      <div className="flex flex-col mb-16">
        <Heading title="Language Space" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Precision environment for linguistic neural growth. Automate lexical retention,
          track immersion density, and visualize mastery balance across five core spheres.
        </p>
      </div>

      {/* Operational Workflow Section */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Neural Workflow</h4>
          <div className="h-px flex-1 bg-border/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {workflow.map((w, i) => (
            <div key={w.step} className="relative group">
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-heading text-border group-hover:text-accent/20 transition-colors duration-500">
                  {w.step}
                </span>
                <div className="flex items-center gap-2">
                  <w.icon size={14} className="text-accent/60" />
                  <h5 className="font-mono text-[11px] text-text uppercase tracking-widest">{w.name}</h5>
                </div>
                <p className="text-secondary text-xs leading-relaxed pr-4">
                  {w.desc}
                </p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-4 translate-y-[-50%] text-border">
                  <ChevronRight size={16} strokeWidth={1.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Environments Grid */}
      <div className="mb-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em]">Active Environments</h4>
            <span className="text-[10px] font-mono text-muted uppercase bg-surface px-2 py-0.5 rounded border border-border/40">
              {userLanguages.length} Active
            </span>
          </div>
          <Link
            href="/languages/add"
            className="flex items-center gap-2 text-[10px] font-mono text-accent hover:text-text transition-colors uppercase tracking-[0.2em]"
          >
            <Plus size={14} />
            <span>Map New Language</span>
          </Link>
        </div>

        {userLanguages.length === 0 ? (
          <div className="bg-surface/30 border border-dashed border-border/40 p-24 rounded-2xl text-center">
            <Languages size={48} className="mx-auto text-muted/20 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tight text-muted mb-8">Zero Active Neural Nodes</h3>
            <Link
              href="/languages/add"
              className="bg-accent text-bg px-10 py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] hover:scale-105 transition-all inline-block"
            >
              Initialize System
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {languagesWithStats.map((ul) => (
              <div
                key={ul.id}
                className="group relative bg-surface border border-border p-8 rounded-xl hover:bg-raised transition-all duration-300 hover:border-accent/40 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                  <span className="font-heading text-8xl uppercase leading-none tracking-tighter -mr-8">
                    {ul.language.code}
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{ul.language.icon}</span>
                        <h3 className="font-heading text-5xl text-text uppercase leading-none tracking-tight group-hover:text-accent transition-colors">
                          {ul.language.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
                        {ul.level} · {ul.totalXp.toLocaleString()} XP
                      </span>
                    </div>
                    <div className="shrink-0">
                      <LanguageRadarChart stats={ul.stats} size={120} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-bg/40 border border-border/40 p-4 rounded-xl">
                      <p className="text-[9px] font-mono text-muted uppercase tracking-[0.2em] mb-1">Neural Depth</p>
                      <p className="text-xl font-black uppercase">0 Logs</p>
                    </div>
                    <div className="bg-bg/40 border border-border/40 p-4 rounded-xl">
                      <p className="text-[9px] font-mono text-muted uppercase tracking-[0.2em] mb-1">Lexicon SRS</p>
                      <p className="text-xl font-black uppercase">0 Items</p>
                    </div>
                  </div>

                  <Link href={`/languages/${ul.id}`} className="flex items-center gap-2 text-[10px] font-mono text-muted hover:text-text transition-colors">
                    <span>Enter Space</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Intelligence Footer */}
      <div className="bg-surface/50 border border-border-dim rounded-2xl p-10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <h4 className="text-[10px] font-mono text-muted uppercase tracking-[0.3em]">System Intelligence</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent/80">
              <Brain size={14} />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Cognitive Engine</p>
            </div>
            <p className="text-sm font-bold text-text uppercase tracking-tight">SM-2 Spaced Repetition</p>
            <p className="text-[11px] text-secondary leading-relaxed">
              Optimized review intervals based on neural forgetting curves.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent/80">
              <Target size={14} />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Input Logic</p>
            </div>
            <p className="text-sm font-bold text-text uppercase tracking-tight">Comprehensible i+1</p>
            <p className="text-[11px] text-secondary leading-relaxed">
              Focus on acquisition through understood messages at a slight challenge.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent/80">
              <Activity size={14} />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Acquisition Model</p>
            </div>
            <p className="text-sm font-bold text-text uppercase tracking-tight">Sphere Balancing</p>
            <p className="text-[11px] text-secondary leading-relaxed">
              Real-time visualization of Input/Output proficiency balance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent/80">
              <Trophy size={14} />
              <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Tracking Unit</p>
            </div>
            <p className="text-sm font-bold text-text uppercase tracking-tight">Immersion Density</p>
            <p className="text-[11px] text-secondary leading-relaxed">
              Quantifying minutes of exposure per sphere for objective progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
