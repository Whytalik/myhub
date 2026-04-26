import type { Metadata } from "next";
import { SpaceLanding } from "@/components/space-landing";

export const metadata: Metadata = {
  title: "Life System",
};

export default function LifeSystemPage() {
  return (
    <SpaceLanding
      header={{
        label: "life system",
        title: "Life System",
        description: "The central hub for your personal operating system.",
      }}
    >
      <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-raised flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        </div>
        <h3 className="text-xl font-heading text-text uppercase mb-2">Under Construction</h3>
        <p className="text-sm text-secondary max-w-sm">
          We are currently building this system to provide a more unified experience for your personal growth.
        </p>
      </div>
    </SpaceLanding>
  );
}
