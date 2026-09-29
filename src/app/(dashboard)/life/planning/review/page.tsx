import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { ReviewHistory } from "@/features/life/components/review/ReviewHistory";
import { ReviewSchedule } from "@/features/life/components/review/ReviewSchedule";
import { WeeklyReviewClient } from "@/features/life/components/review/WeeklyReviewClient";
import * as sphereService from "@/features/life/services/sphere-service";
import * as weeklyReviewService from "@/features/life/services/weekly-review-service";

export const metadata: Metadata = { title: "Weekly Review" };

export default async function WeeklyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const { week } = await searchParams;
  const [data, spheres, settings] = await Promise.all([
    weeklyReviewService.getWeeklyReviewData(userId, week),
    sphereService.getAllSpheres(userId),
    weeklyReviewService.getSettings(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "planning" },
          { label: "review" },
        ]}
        title="Weekly Review"
        description="Close the week, learn from it, plan the next one. About 30 minutes."
      />
      <ReviewSchedule settings={settings} />
      <WeeklyReviewClient
        key={data.weekStart}
        data={data}
        spheres={spheres.filter((sphere) => sphere.isActive)}
      />
      <ReviewHistory data={data} />
    </div>
  );
}
