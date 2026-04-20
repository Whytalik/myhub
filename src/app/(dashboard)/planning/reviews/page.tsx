import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { CheckCircle2, BarChart3, RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Review Center | Planning",
};

export default function ReviewsPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "review center" }
      ]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Review Center" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Level 05: Accountability, scorecards, and recalibration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weekly Scorecard */}
        <section className="bg-surface border border-border p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-blue-500" size={20} />
            <h2 className="text-xl font-bold uppercase tracking-tight text-text">Weekly Scorecard</h2>
          </div>
          <div className="p-10 bg-raised/20 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
            <BarChart3 size={32} className="text-muted mb-4 opacity-20" />
            <p className="text-xs text-muted italic">
              Future implementation: Automated scoring of tactical execution. 
              (Completed Tactics / Total Tactics).
            </p>
          </div>
        </section>

        {/* Calibration Hub */}
        <section className="bg-surface border border-border p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <RotateCcw className="text-blue-500" size={20} />
            <h2 className="text-xl font-bold uppercase tracking-tight text-text">Recalibration Hub</h2>
          </div>
          <div className="space-y-4">
             <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-xl">
               <h4 className="text-[10px] font-bold uppercase text-blue-500 mb-2">Monthly Strategy Bridge</h4>
               <p className="text-xs text-secondary leading-relaxed">
                 The crucial layer you mentioned. Monthly check-ins to bridge 12-week sprints with Global Vision.
               </p>
             </div>
             <div className="p-6 bg-raised/30 border border-border rounded-xl">
               <h4 className="text-[10px] font-bold uppercase text-muted mb-2">Cycle Transition</h4>
               <p className="text-xs text-secondary leading-relaxed">
                 Reflecting on the entire 12-week cycle before starting the next one.
               </p>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
