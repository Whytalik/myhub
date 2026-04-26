import type { Metadata } from "next";
import { SpaceLanding } from "@/components/space-landing";
import { Fish } from "lucide-react";

export const metadata: Metadata = {
  title: "Fishing",
};

export default function FishingPage() {
  return (
    <SpaceLanding
      header={{
        label: "fishing",
        title: "Fishing",
        description: "Track your fishing trips, log catches, and map your favorite spots. Coming soon.",
      }}
    >
      <div className="bg-surface/30 border border-dashed border-border/40 p-24 rounded-2xl text-center">
        <Fish size={48} className="mx-auto text-muted/20 mb-6" />
        <h3 className="text-2xl font-black uppercase tracking-tight text-muted mb-4">Fishing Space Coming Soon</h3>
        <p className="text-secondary text-sm max-w-md mx-auto">
          Trip logs, catch tracking, and spot mapping are currently under development.
        </p>
      </div>
    </SpaceLanding>
  );
}
