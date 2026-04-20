import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

export const metadata: Metadata = {
  title: "Life System",
};

export default function LifeSystemPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life system" }]} />
      
      <div className="flex flex-col mb-16">
        <Heading title="Life System" />
        <p className="text-secondary max-w-2xl leading-relaxed">
          The central hub for your personal operating system. 
          Integration of habits, goals, and reflections is coming soon.
        </p>
      </div>

      <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-raised flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>
        <h3 className="text-xl font-heading text-text uppercase mb-2">Under Construction</h3>
        <p className="text-sm text-secondary max-w-sm">
          We are currently building this system to provide a more unified experience for your personal growth.
        </p>
      </div>
    </div>
  );
}
