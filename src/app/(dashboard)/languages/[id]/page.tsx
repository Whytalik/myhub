"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Tabs } from "@/components/ui/tabs";
import { LanguageRadarChart } from "@/features/languages/components/LanguageRadarChart";
import { ImmersionTimer } from "@/features/languages/components/ImmersionTimer";
import { VocabularyManager } from "@/features/languages/components/VocabularyManager";
import { 
  Zap, 
  History, 
  Headphones,
  Book,
  Mic,
  PenTool,
  Library,
  Target,
  LayoutDashboard,
  Brain
} from "lucide-react";
import { LanguageSphere } from "@/app/generated/prisma";
import { getLanguageStatsAction } from "@/features/languages/actions/language-actions";

const sphereIcons: Record<LanguageSphere, any> = {
  [LanguageSphere.VOCABULARY]: Library,
  [LanguageSphere.LISTENING]: Headphones,
  [LanguageSphere.READING]: Book,
  [LanguageSphere.SPEAKING]: Mic,
  [LanguageSphere.WRITING]: PenTool,
};

export default function LanguageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const statsRes = await getLanguageStatsAction(id);
      if (statsRes.success) setStats(statsRes.data as any[]);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "vocabulary", label: "Vocabulary" },
    { id: "journal", label: "Journal" },
    { id: "resources", label: "Resources" },
  ];

  if (loading) return (
    <div className="px-14 py-10 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Initialising Space...</p>
      </div>
    </div>
  );

  return (
    <div className="px-14 py-10 min-h-screen bg-bg">
      <Breadcrumb items={[
        { label: "languages", href: "/languages" },
        { label: "environment hub" }
      ]} />
      
      <div className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-accent/10 flex items-center justify-center text-4xl shadow-inner border border-accent/20">
            🌐
          </div>
          <div>
            <Heading title="Language Hub" className="text-5xl font-black uppercase tracking-tighter" />
            <div className="flex items-center gap-3 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <p className="text-secondary font-mono text-[10px] uppercase tracking-[0.25em]">
                Active Neural Environment
              </p>
            </div>
          </div>
        </div>

        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          className="shadow-sm"
        />
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="lg:col-span-2 flex flex-col gap-12">
            <div className="bg-surface/60 border border-border/40 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-12 backdrop-blur-sm shadow-xl">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-2.5 rounded-2xl bg-accent text-bg shadow-lg shadow-accent/20">
                    <Target size={20} strokeWidth={3} />
                  </div>
                  <h4 className="font-black text-2xl uppercase tracking-tight">Mastery Radar</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {stats.map((stat) => {
                    const Icon = sphereIcons[stat.sphere as LanguageSphere];
                    return (
                      <div key={stat.sphere} className="p-5 bg-raised/40 rounded-2xl border border-border/30 hover:border-accent/20 transition-colors">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2.5">
                            <Icon size={14} className="text-accent" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">{stat.sphere}</span>
                          </div>
                          <span className="text-[13px] font-black uppercase">{Math.round(stat.mastery)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg/80 rounded-full overflow-hidden border border-border/10">
                          <div 
                            className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(224,155,47,0.4)]" 
                            style={{ width: `${stat.mastery}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="shrink-0 bg-bg/60 p-8 rounded-[48px] border border-border/20 shadow-inner">
                <LanguageRadarChart stats={stats} size={260} />
              </div>
            </div>

            {/* Neural Insights */}
            <div className="bg-surface/30 border border-border/30 rounded-[32px] p-8">
              <div className="flex items-center gap-4 mb-6">
                <Brain size={18} className="text-accent/60" />
                <h4 className="text-[11px] font-mono text-muted uppercase tracking-[0.3em] font-bold">Neural Insights</h4>
              </div>
              <p className="text-secondary text-sm leading-relaxed font-medium italic opacity-80">
                Your cognitive load is currently optimized. Continue building "Input" through listening 
                to reach the next proficiency milestone.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <ImmersionTimer userLanguageId={id} />
            
            <div className="bg-surface/50 border border-border/40 p-8 rounded-[40px] flex-1 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-2.5 rounded-2xl bg-accent/10 text-accent">
                  <LayoutDashboard size={20} />
                </div>
                <h4 className="font-black text-2xl uppercase tracking-tight">Status</h4>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-border/20 pb-4">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Neural Streak</span>
                  <span className="text-2xl font-black uppercase">0 Days</span>
                </div>
                <div className="flex justify-between items-end border-b border-border/20 pb-4">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">Total Depth</span>
                  <span className="text-2xl font-black uppercase">0 Logs</span>
                </div>
                <div className="flex justify-between items-end border-b border-border/20 pb-4">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-widest font-bold">CEFR Target</span>
                  <span className="text-2xl font-black uppercase text-accent">Level A1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "vocabulary" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <VocabularyManager userLanguageId={id} initialItems={[]} />
        </div>
      )}

      {activeTab === "journal" && (
        <div className="bg-surface/40 border border-border/40 p-12 rounded-[48px] animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
           <div className="flex items-center gap-5 mb-12">
              <div className="p-3 rounded-2xl bg-accent text-bg shadow-lg shadow-accent/20">
                <History size={24} strokeWidth={3} />
              </div>
              <h4 className="font-black text-3xl uppercase tracking-tight">Immersion History</h4>
           </div>
           
           <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-24 h-24 rounded-[32px] bg-raised/50 border border-border/40 flex items-center justify-center text-muted/30 mb-8 shadow-inner">
                <History size={48} />
              </div>
              <p className="text-secondary font-mono text-[11px] uppercase tracking-[0.2em] font-bold">No sessions mapped in this quadrant</p>
           </div>
        </div>
      )}

      {activeTab === "resources" && (
        <div className="bg-surface/40 border border-border/40 p-12 rounded-[48px] animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
           <div className="flex items-center gap-5 mb-12">
              <div className="p-3 rounded-2xl bg-accent text-bg shadow-lg shadow-accent/20">
                <Book size={24} strokeWidth={3} />
              </div>
              <h4 className="font-black text-3xl uppercase tracking-tight">Resource Matrix</h4>
           </div>
           <p className="text-secondary font-mono text-[11px] uppercase tracking-[0.2em] font-bold">System materials pending library initialization</p>
        </div>
      )}
    </div>
  );
}
