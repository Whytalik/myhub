import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { FocusJournalCard } from "@/features/life/components/goals/FocusJournalCard";
import { SetupChecklist } from "@/features/life/components/goals/SetupChecklist";
import { ReviewDueBanner } from "@/features/life/components/review/ReviewDueBanner";
import * as nowService from "@/features/life/services/now-service";

export const metadata: Metadata = { title: "Now" };

function NowCard({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-panel-title">{title}</span>
        <Link href={href} className="text-[11px] text-accent-life hover:underline shrink-0">
          {linkLabel}
        </Link>
      </div>
      {children}
    </div>
  );
}

export default async function NowPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const summary = await nowService.getNowSummary(userId);
  const { sprint } = summary;
  const overdueClassName = `text-xs ${summary.overdueCount > 0 ? "text-amber-400" : "text-zinc-500"}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "now" }]}
        title="Now"
        description="What matters today, this week and this year, on one screen."
      />

      {summary.reviewDue.isDue && <ReviewDueBanner weekStart={summary.reviewDue.weekStart} />}

      <SetupChecklist progress={summary.setup} />
      {summary.focus && <FocusJournalCard summary={summary.focus} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NowCard title="Today" href="/life/journal" linkLabel="Open journal →">
          {summary.todayTasks.length === 0 ? (
            <p className="text-caption">Nothing planned for today.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {summary.todayTasks.map((task) => (
                <li key={task.id} className="text-sm text-zinc-200 break-words">
                  {task.isFrog ? "🐸" : "○"} {task.title}
                </li>
              ))}
            </ul>
          )}
          <span className="text-[11px] font-mono text-zinc-500">
            {summary.todayOpenCount} open today
          </span>
          {summary.overdueCount > 0 && (
            <Link href="/life/planning/review" className={overdueClassName}>
              {summary.overdueCount} overdue atoms to sort out in the review →
            </Link>
          )}
        </NowCard>

        <NowCard title="This week" href="/life/sprint" linkLabel="Sprint dashboard →">
          <p className="text-sm text-zinc-200">
            Sprint {sprint.number} · week {sprint.weekNumber} · {sprint.daysLeft} days left
          </p>
          {summary.priorities.length === 0 ? (
            <p className="text-caption">No priorities yet. Set them in the Sunday review.</p>
          ) : (
            <ol className="flex flex-col gap-1">
              {summary.priorities.map((priority, index) => (
                <li key={index} className="text-sm text-zinc-300 break-words">
                  {index + 1}. {priority}
                </li>
              ))}
            </ol>
          )}
        </NowCard>

        <NowCard title="Inbox" href="/life/planning/wizard" linkLabel="Planning Wizard →">
          <p className="text-sm text-zinc-200">
            {summary.inboxCount === 0
              ? "Inbox is empty."
              : `${summary.inboxCount} thought${summary.inboxCount === 1 ? "" : "s"} waiting to be processed.`}
          </p>
        </NowCard>
      </div>
    </div>
  );
}
