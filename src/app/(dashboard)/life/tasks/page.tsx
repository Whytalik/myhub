import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { TasksPageClient } from "@/features/life/components/tasks/TasksPageClient";
import * as taskService from "@/features/life/services/task-service";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    redirect("/login");
  }

  const params = await searchParams;

  let tasks: Awaited<ReturnType<typeof taskService.getAllTasks>> = [];
  let calendarTasks: typeof tasks = [];
  let spheres: Awaited<ReturnType<typeof taskService.getAllSpheres>> = [];

  try {
    [tasks, calendarTasks, spheres] = await Promise.all([
      taskService.getAllTasks(userId),
      taskService.getCalendarTasks(userId),
      taskService.getAllSpheres(userId),
    ]);
  } catch (error) {
    console.error("Critical error in TasksPage:", error);
    return (
      <div className="glass-card p-6 flex flex-col gap-3">
        <h1 className="text-panel-title text-rose-400">Failed to load Tasks</h1>
        <p className="text-caption">
          There was an internal error loading your data. Please check the logs.
        </p>
        <div className="rounded-lg bg-black/25 border border-white/[0.08] p-3">
          <code className="text-xs font-mono text-rose-400">{(error as Error).message}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "life space", href: "/life" }, { label: "tasks" }]}
        title="Tasks"
        description="Committed next-actions — the clarified output of planning, ready to execute."
      />
      <TasksPageClient
        initialTasks={tasks}
        calendarTasks={calendarTasks}
        spheres={spheres}
        initialView={params.view}
      />
    </div>
  );
}
