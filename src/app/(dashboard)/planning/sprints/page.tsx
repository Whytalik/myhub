import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SprintManager } from "@/features/operations/components/SprintManager";
import { auth } from "@/auth";
import * as sprintService from "@/features/operations/services/sprint-service";

export const metadata: Metadata = {
  title: "12-Week Sprints | Planning",
};

export default async function SprintsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  const initialSprint = userId ? await sprintService.getActiveSprint(userId) : null;

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[
        { label: "planning space", href: "/planning" },
        { label: "12-week sprints" }
      ]} />
      
      <div className="mt-8">
        <SprintManager initialSprint={initialSprint} />
      </div>
    </div>
  );
}
