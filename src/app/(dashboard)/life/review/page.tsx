import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { getReviewData } from "@/features/life/services/review-service";
import { ReviewClient } from "@/features/life/components/review/ReviewClient";

export const metadata: Metadata = {
  title: "Weekly Review",
};

export default async function ReviewPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { entries, habits, tasks } = await getReviewData(userId);

  return (
    <div className="px-8 py-8 flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "review" }]}
        title="Weekly Review"
        description="Step back and see the week as a whole — metrics, trends, and patterns worth noticing."
      />

      <ReviewClient entries={entries} habits={habits} tasks={tasks} />
    </div>
  );
}
