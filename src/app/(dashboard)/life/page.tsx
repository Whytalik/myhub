import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SpaceLanding, SpaceError, ModuleQuickAccess, DailyOverview, QuickActions } from "@/components/space-landing";
import { BookText, CheckCircle2, Zap, Plus, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Life Space",
};

async function fetchLifeData(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [habits, completions, tasks, journalEntry] = await Promise.all([
    prisma.habit.findMany({ where: { userId, archived: false } }),
    prisma.habitCompletion.count({ where: { habit: { userId }, date: today } }),
    prisma.task.count({ where: { userId, NOT: { status: { in: ["DONE", "CANCELLED"] } } } }),
    prisma.dailyEntry.findUnique({ where: { userId_date: { userId, date: today } } }),
  ]);

  return { habits, completions, tasks, journalEntry };
}

async function fetchJournalStatus(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.dailyEntry.findUnique({ where: { userId_date: { userId, date: today } } });
}

export default async function LifeSpacePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  let lifeData: Awaited<ReturnType<typeof fetchLifeData>> | null = null;
  let journalStatus: Awaited<ReturnType<typeof fetchJournalStatus>> | null = null;
  let error: Error | null = null;

  try {
    lifeData = await fetchLifeData(userId);
    journalStatus = await fetchJournalStatus(userId);
  } catch (e) {
    console.error("[LifeSpace] Failed to load:", e);
    error = e instanceof Error ? e : new Error(String(e));
  }

  const modules = [
    {
      title: "Journal",
      href: "/life/journal",
      description: "Morning & evening routines, sleep, energy & mood, nutrition, and daily reflection.",
      icon: BookText,
      status: "Active",
    },
    {
      title: "Tasks",
      href: "/life/tasks",
      description: "Hierarchical task management organized by life spheres. Gallery and calendar views.",
      icon: CheckCircle2,
      status: "Active",
    },
    {
      title: "Habits",
      href: "/life/habits",
      description: "Daily discipline tracker with today's practice check-ins and success analytics.",
      icon: Zap,
      status: "Active",
    },
  ];

  if (error) {
    return (
      <SpaceLanding
        header={{
          label: "life space",
          title: "Life Space",
          description: "Your personal cognitive environment. Manage your mental clarity, track consistency, and build the discipline required for your ultimate goals.",
        }}
      >
        <SpaceError
          message="Failed to load space data. Please try refreshing the page later."
          developerError={error.message}
        />
      </SpaceLanding>
    );
  }

  return (
    <SpaceLanding
      header={{
        label: "life space",
        title: "Life Space",
        description: "Your personal cognitive environment. Manage your mental clarity, track consistency, and build the discipline required for your ultimate goals.",
      }}
      intelligence={{
        items: [
          { label: "Tracking Engine", value: "Daily Journal + Habits" },
          { label: "Task System", value: "Hierarchical OKRs" },
          { label: "Habit Logic", value: "Streak + Recovery" },
        ],
      }}
    >
      <DailyOverview
        title="Today"
        items={[
          { label: "Habits", value: `${lifeData!.completions}/${lifeData!.habits.length}`, icon: Zap },
          { label: "Open Tasks", value: lifeData!.tasks.toString(), icon: CheckCircle2 },
          { label: "Journal", value: lifeData!.journalEntry ? "Done" : "Pending", icon: BookText },
        ]}
      />
      <QuickActions
        actions={[
          {
            label: journalStatus ? "View Journal" : "Start Journal",
            href: "/life/journal",
            icon: FileText,
            variant: "primary",
          },
          {
            label: "Add Task",
            href: "/life/tasks",
            icon: Plus,
            variant: "secondary",
          },
        ]}
      />
      <ModuleQuickAccess modules={modules} />
    </SpaceLanding>
  );
}
