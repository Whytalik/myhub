import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Progress" };

export default function ProgressPage() {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <PageHeader
        breadcrumb={[{ label: "fitness", href: "/fitness" }, { label: "progress" }]}
        title="Progress"
        description="Track volume, PRs, and body metrics over time — coming soon."
      />
    </div>
  );
}
