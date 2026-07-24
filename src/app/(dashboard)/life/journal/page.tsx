import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getEntryByDate } from "@/features/life/services/journal-service";
import * as taskService from "@/features/life/services/task-service";
import * as habitService from "@/features/life/services/habit-service";
import * as thoughtService from "@/features/life/services/thought-service";
import { getScheduleByDate } from "@/features/life/services/schedule-service";
import { DailyEntryForm } from "@/features/life/components/DailyEntryForm";
import type { DailyEntryData, HabitData } from "@/features/life/types";
import type { RoutineMap } from "@/lib/life/routine-items";
import { invalidateTaskCache } from "@/lib/cache/revalidate";
import { History } from "lucide-react";

export const metadata: Metadata = {
  title: "Daily Journal",
};

function currentTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isValidDateStr(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { date: dateParam } = await searchParams;
  const todayStr = currentTodayStr();
  const dateStr = dateParam && isValidDateStr(dateParam) ? dateParam : todayStr;
  const isPast = dateStr !== todayStr;

  if (!isPast) {
    const carried = await taskService.autoCarryOverYesterdayTasks(userId, dateStr);
    if (carried > 0) invalidateTaskCache(userId);
  }

  const date = new Date(dateStr);
  const [y, m, d] = dateStr.split("-").map(Number);
  const yesterday = new Date(y, m - 1, d - 1);

  const [raw, yesterdayRaw, tasks, yesterdayTasks, allTasks, spheres, habits, schedule, board] =
    await Promise.all([
      getEntryByDate(userId, date),
      getEntryByDate(userId, yesterday),
      taskService.getTasksByDate(userId, date),
      taskService.getTasksByDate(userId, yesterday),
      taskService.getAllTasks(userId),
      taskService.getAllSpheres(userId),
      habitService.getActiveHabits(userId),
      getScheduleByDate(userId, date),
      thoughtService.getBoard(userId),
    ]);

  const inboxThoughtCount = board
    .filter((status) => {
      const lowerName = status.name.toLowerCase();
      return (
        lowerName === "inbox" ||
        lowerName === "інбокс" ||
        lowerName === "беклог" ||
        lowerName === "backlog" ||
        lowerName === "вхідні"
      );
    })
    .reduce((sum, status) => sum + status.thoughts.length, 0);

  const yesterdayCompletedTasks = yesterdayTasks
    .filter((t) => t.status === "DONE")
    .map((t) => t.title);

  const entry: DailyEntryData | null = raw
    ? {
        ...raw,
        morningRoutine: (raw.morningRoutine as RoutineMap | null) ?? null,
        eveningRoutine: (raw.eveningRoutine as RoutineMap | null) ?? null,

        startedAt: ((raw as any).startedAt as Date | null) ?? null,

        completedAt: ((raw as any).completedAt as Date | null) ?? null,
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          breadcrumb={[
            { label: "life space", href: "/life" },
            ...(isPast
              ? [{ label: "daily journal", href: "/life/journal" }]
              : [{ label: "daily journal" }]),
            ...(isPast ? [{ label: dateStr }] : []),
          ]}
          title={
            isPast
              ? new Date(dateStr).toLocaleDateString("en-US", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Daily Journal"
          }
          description={isPast ? undefined : "Daily reflection, tracking, and intention."}
        />
        <Link
          href="/life/history"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors shrink-0"
        >
          <History size={14} />
          History
        </Link>
      </div>

      {!isPast && yesterdayRaw && !yesterdayRaw.completedAt && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
          <div className="flex items-start gap-2.5 text-zinc-200">
            <span className="text-lg shrink-0">🌙</span>
            <div>
              <p className="font-semibold text-zinc-100">
                Вчорашній день (
                {yesterday.toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "long",
                })}
                ) не завершено
              </p>
              <p className="text-xs text-zinc-400">
                Ви вимкнули пристрої о 21:00? Ви можете заповнити вечірні звички та завершити
                вчорашній день retrospectively.
              </p>
            </div>
          </div>
          <Link
            href={`/life/journal?date=${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors shrink-0"
          >
            Завершити вчора
          </Link>
        </div>
      )}

      <DailyEntryForm
        key={dateStr}
        initialEntry={entry}
        todayStr={dateStr}
        isPast={isPast}
        yesterdayBrainDump={yesterdayRaw?.brainDump ?? null}
        yesterdayStandupPlan={yesterdayRaw?.standupPlan ?? null}
        yesterdayCompletedTasks={yesterdayCompletedTasks}
        tasks={tasks}
        allTasks={allTasks}
        spheres={spheres}
        habits={habits as unknown as HabitData[]}
        scheduledTrainingDayName={schedule?.trainingDay?.name ?? undefined}
        inboxThoughtCount={inboxThoughtCount}
      />
    </div>
  );
}
