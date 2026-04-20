import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Target, Flag, Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Vision & Milestones | Planning",
};

export default function VisionPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "vision & milestones" }
      ]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Vision & Milestones" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Level 01 & 02: Defining the ultimate destination and tactical checkpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12 max-w-4xl">
        {/* Level 01 Placeholder */}
        <section className="bg-surface border border-border p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <Rocket size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-rose-500" size={20} />
            <h2 className="text-xl font-bold uppercase tracking-tight text-text">Ultimate North Star</h2>
          </div>
          <div className="p-12 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-center italic text-muted text-sm">
            Future implementation: A qualitative, values-driven description of your life in 10-25 years.
          </div>
        </section>

        {/* Level 02 Placeholder */}
        <section className="bg-surface border border-border p-8 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Flag className="text-rose-500" size={20} />
            <h2 className="text-xl font-bold uppercase tracking-tight text-text">3-Year Milestones</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="p-6 bg-raised/30 border border-border rounded-xl h-32 flex items-center justify-center text-center text-[10px] uppercase tracking-widest text-muted font-mono">
                 Milestone Slot {i}
               </div>
             ))}
          </div>
          <p className="mt-6 text-xs text-secondary italic">
            Future implementation: Tangible, ambitious checkpoints that bridge Vision and Reality.
          </p>
        </section>
      </div>
    </div>
  );
}
