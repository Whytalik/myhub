import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

export const metadata: Metadata = { title: "Workouts" };

export default function WorkoutsPage() {
  return (
    <div className="px-14 py-10">
      <Breadcrumb items={[{ label: "fitness", href: "/fitness" }, { label: "workouts" }]} />
      <Heading title="Workouts" />
      <p className="text-secondary text-sm italic">Log and plan training sessions — coming soon.</p>
    </div>
  );
}
