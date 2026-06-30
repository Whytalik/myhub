import type { Metadata } from "next";
import { Dumbbell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Training",
};

export default function TrainingPage() {
  return (
    <div className="px-8 py-8">
      <PageHeader
        breadcrumb={[{ label: "health space", href: "/health" }, { label: "training" }]}
        title="Training"
        description="Log workouts, track progress, and build strength consistently."
      />
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Dumbbell size={28} className="text-accent opacity-60" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
          <p className="text-text-primary font-medium text-note">Coming soon</p>
          <p className="text-text-secondary text-subtitle leading-relaxed">
            Log workouts, track sets and reps, and monitor your training progress over time.
          </p>
        </div>
      </div>
    </div>
  );
}
