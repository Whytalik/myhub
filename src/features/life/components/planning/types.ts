import type { ThoughtUrgencyLevel } from "@/features/life/logic/filter-outcomes";
import type { ThoughtType } from "@/features/life/logic/thought-types";

export interface ThoughtItem {
  id: string;
  content: string;
  statusId: string;
  status: {
    id: string;
    name: string;
  };
  sphereId: string | null;
  type?: ThoughtType | null;
  templateData?: Record<string, string> | null;
  urgency?: ThoughtUrgencyLevel | null;
}

export interface SprintTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  resistance: number | null;
  parentId: string | null;
  projectId?: string | null;
  sphereId: string | null;
  plannedDate: Date | string | null;
  children: SprintTask[];
}

export interface SprintProject {
  id: string;
  title: string;
  description: string | null;
  status: string;
  objectiveId: string | null;
  tasks: SprintTask[];
}

export interface SprintObjective {
  id: string;
  title: string;
  description: string | null;
  sphereId: string;
  sphere: { id: string; name: string; color: string; icon: string } | null;
  projects: SprintProject[];
}

export interface SprintData {
  id: string;
  title: string;
  number: number;
  year: number;
  startDate: Date | string;
  endDate: Date | string;
  status: string;
  objectives: SprintObjective[];
}
