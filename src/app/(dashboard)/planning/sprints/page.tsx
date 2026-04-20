import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Zap, ListTodo, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "12-Week Sprints | Planning",
};

export default function SprintsPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "12-week sprints" }
      ]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="12-Week Sprints" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Level 04: The tactical engine. High-urgency execution cycles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Goals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                 <Zap size={14} className="text-emerald-500" />
                 Active Objectives
               </h3>
               <span className="text-[10px] font-mono text-muted">Sprint 01/04</span>
            </div>
            <div className="space-y-4">
               {[1, 2].map(i => (
                 <div key={i} className="p-8 border border-dashed border-border/60 rounded-xl text-center text-xs text-muted italic">
                   Goal Slot {i} (Future Implementation: OKR-style objectives)
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Project Pipeline placeholder */}
        <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
           <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2 mb-6">
             <Activity size={14} className="text-emerald-500" />
             Project Pipeline
           </h3>
           <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 bg-raised/30 border border-border/40 rounded-lg">
                  <div className="w-1/2 h-1 bg-border/40 rounded-full mb-2" />
                  <div className="w-3/4 h-2 bg-border/20 rounded-full" />
                </div>
              ))}
           </div>
           <p className="mt-6 text-[10px] text-secondary italic leading-relaxed">
             Future implementation: 2-3 week projects that break down the 12-week goals.
           </p>
        </div>
      </div>
    </div>
  );
}
