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
  const personId = session?.user?.personId;

  if (!session || !personId) {
    redirect("/login");
  }

  const params = await searchParams;

  const [tasks, calendarTasks, spheres] = await Promise.all([
    taskService.getAllTasks(personId),
    taskService.getCalendarTasks(personId),
    taskService.getAllSpheres(personId),
  ]);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life system", href: "/life" }, { label: "tasks" }]} />
      <TasksPageClient
        initialTasks={tasks}
        calendarTasks={calendarTasks}
        spheres={spheres}
        initialView={params.view}
      />
    </div>
  );
}
