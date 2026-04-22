import { SprintStatus, ObjectiveStatus, TacticFrequency, TaskStatus } from "@/app/generated/prisma";

export interface SprintData {
  id: string;
  number: number;
  year: number;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  objectives: ObjectiveData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ObjectiveData {
  id: string;
  sprintId: string;
  sphereId: string;
  sphereName?: string;
  sphereColor?: string;
  title: string;
  description: string | null;
  status: ObjectiveStatus;
  keyResults: KeyResultData[];
  projects: ProjectData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyResultData {
  id: string;
  objectiveId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string | null;
  progress: number;
  tactics: TacticData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectData {
  id: string;
  objectiveId: string;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: TaskStatus;
  taskCount: number;
  completedTaskCount: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TacticData {
  id: string;
  keyResultId: string;
  title: string;
  description: string | null;
  frequency: TacticFrequency;
  completions: TacticCompletionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TacticCompletionData {
  id: string;
  tacticId: string;
  weekNumber: number;
  completed: boolean;
  createdAt: Date;
}

export interface SprintReviewData {
  id: string;
  sprintId: string;
  weekNumber: number;
  date: Date;
  score: number | null;
  wins: string | null;
  challenges: string | null;
  adjustments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertSprintInput {
  id?: string;
  number: number;
  year: number;
  startDate: Date;
  endDate: Date;
  status?: SprintStatus;
}

export interface UpsertObjectiveInput {
  id?: string;
  sprintId: string;
  sphereId: string;
  title: string;
  description?: string | null;
  status?: ObjectiveStatus;
}

export interface UpsertKeyResultInput {
  id?: string;
  objectiveId: string;
  title: string;
  targetValue: number;
  currentValue?: number;
  unit?: string | null;
}

export interface UpsertTacticInput {
  id?: string;
  keyResultId: string;
  title: string;
  description?: string | null;
  frequency?: TacticFrequency;
}
