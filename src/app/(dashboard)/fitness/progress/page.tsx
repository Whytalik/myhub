import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "fitness", href: "/fitness" }, { label: "progress" }]} />
      <Heading title="Progress" />
      <p className="text-secondary text-sm italic">Track volume, PRs, and body metrics over time — coming soon.</p>
    </div>
  );
}
