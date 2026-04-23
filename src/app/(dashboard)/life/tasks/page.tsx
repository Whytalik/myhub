import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { TasksPageClient } from "@/features/life/components/tasks/TasksPageClient";
import * as taskService from "@/features/life/services/task-service";

export const metadata: Metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Failed to load Tasks</h1>
        <p className="text-secondary mb-6">There was an internal error loading your data. Please check the logs.</p>
        <div className="p-4 bg-surface border border-border rounded-lg text-left overflow-auto max-w-2xl mx-auto">
          <code className="text-xs text-muted">{(error as Error).message}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life space", href: "/life" }, { label: "tasks" }]} />
      <TasksPageClient
        initialTasks={tasks}
        calendarTasks={calendarTasks}
        spheres={spheres}
        initialView={params.view}
      />
    </div>
  );
}
