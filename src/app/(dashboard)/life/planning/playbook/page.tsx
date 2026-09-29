import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { PlaybookPageClient } from "@/features/life/components/playbook/PlaybookPageClient";
import * as sphereGoalService from "@/features/life/services/sphere-goal-service";
import * as yearFocusService from "@/features/life/services/year-focus-service";
import * as playbookService from "@/features/life/services/goal-playbook-service";

export const metadata: Metadata = { title: "Goal Playbook" };

export default async function PlaybookPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const year = new Date().getFullYear();
  const [{ goal: requestedGoalId }, goals, focus] = await Promise.all([
    searchParams,
    sphereGoalService.getGoalsForYear(userId, year),
    yearFocusService.getFocus(userId, year),
  ]);

  const goal =
    goals.find((item) => item.id === requestedGoalId) ??
    goals.find((item) => item.id === focus?.leverGoalId) ??
    goals[0];

  const header = (
    <PageHeader
      breadcrumb={[
        { label: "life space", href: "/life" },
        { label: "planning" },
        { label: "playbook" },
      ]}
      title="Goal Playbook"
      description="From the big goal to a 5-minute action, in 12 steps."
    />
  );

  if (!goal) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="glass-card p-6 text-caption">
          Add a measurable goal first on the{" "}
          <Link href="/life/planning/goals" className="text-accent-life underline">
            Life Goals
          </Link>{" "}
          page, then build its playbook here.
        </div>
      </div>
    );
  }

  const playbook = await playbookService.getPlaybook(userId, goal.id);

  return (
    <div className="flex flex-col gap-6">
      {header}
      <PlaybookPageClient
        goals={goals}
        goal={goal}
        playbook={playbook}
        isFocusLever={goal.id === focus?.leverGoalId}
      />
    </div>
  );
}
