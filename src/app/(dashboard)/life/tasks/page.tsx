import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/navigation/breadcrumb";
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
      <div >
        <h1 >Failed to load Tasks</h1>
        <p >There was an internal error loading your data. Please check the logs.</p>
        <div >
          <code >{(error as Error).message}</code>
        </div>
      </div>
    );
  }

  return (
    <div >
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
