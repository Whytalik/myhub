import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

export const metadata: Metadata = { title: "Exercises" };

export default function ExercisesPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "fitness", href: "/fitness" }, { label: "exercises" }]} />
      <Heading title="Exercises" />
      <p className="text-secondary text-sm italic">Exercise library with sets, reps, and notes — coming soon.</p>
    </div>
  );
}
