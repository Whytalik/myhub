import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Exercises" };

export default function ExercisesPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[{ label: "fitness", href: "/fitness" }, { label: "exercises" }]}
        title="Exercises"
        description="Exercise library with sets, reps, and notes — coming soon."
      />
    </div>
  );
}
