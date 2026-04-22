import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SprintManager } from "@/features/operations/components/SprintManager";

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
      
      <div className="mt-8">
        <SprintManager />
      </div>
    </div>
  );
}
