import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Workouts" };

export default function WorkoutsPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[{ label: "fitness", href: "/fitness" }, { label: "workouts" }]}
        title="Workouts"
        description="Log and plan training sessions — coming soon."
      />
    </div>
  );
}
