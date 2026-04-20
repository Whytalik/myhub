import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Compass, Sparkles, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "Annual Compass | Planning",
};

export default function CompassPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "annual compass" }
      ]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Annual Compass" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          Level 03: The strategic focus for the calendar year.
        </p>
      </div>

      <div className="max-w-2xl">
        <section className="bg-surface border border-border p-10 rounded-[2.5rem] text-center border-t-amber-500/50">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <Compass size={32} className="text-amber-500" />
          </div>
          <h2 className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.4em] mb-4">Current Year Theme</h2>
          <div className="py-12 border-y border-border/40 mb-8">
            <p className="text-4xl font-heading text-text uppercase opacity-20 italic">No Theme Defined</p>
          </div>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="p-4 bg-raised/50 rounded-xl">
              <h3 className="text-[10px] font-bold uppercase mb-2 flex items-center gap-2">
                <Sparkles size={12} className="text-amber-500" />
                Annual WIGs
              </h3>
              <p className="text-xs text-secondary leading-relaxed italic">
                Future implementation: 1-2 Wildly Important Goals that dictate the flavor of all 12-week cycles this year.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
