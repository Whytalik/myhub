import type { 
  TaskStatus as PrismaTaskStatus,
  TaskPriority as PrismaTaskPriority,
  Prisma,
} from "@/app/generated/prisma";
import type { RoutineMap } from "@/lib/routine-items";

type JsonValue = Prisma.JsonValue;

//
// --- Base Enums ---
//
export type TaskStatus = PrismaTaskStatus;
export type TaskPriority = PrismaTaskPriority;

//
// --- Life Sphere ---
//
export interface LifeSphereData {
  id: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertSphereInput {
  id?: string;
  name: string;
  color: string;
  icon: string;
  order?: number;
}

//
// --- Task ---
//
export interface TaskData {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  isPrivate: boolean;
  plannedDate: Date | null;
  hasPlannedTime: boolean;
  dueDate: Date | null;
  hasDueTime: boolean;
  depth: number;
  order: number;
  parentId: string | null;
  parentTitle?: string | null;
  parentIcon?: string | null;
  sphereId: string | null;
  sphere: LifeSphereData | null;
  projectId?: string | null;
  project?: { id: string; title: string } | null;
  children: TaskData[];
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertTaskInput {
  id?: string;
  title?: string;
  description?: string | null;
  icon?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  isPrivate?: boolean;
  plannedDate?: string | null;
  hasPlannedTime?: boolean;
  dueDate?: string | null;
  hasDueTime?: boolean;
  parentId?: string | null;
  sphereId?: string | null;
  projectId?: string | null;
}

//
// --- Daily Journal Entry ---
//
export interface DailyEntryData {
  id: string;
  date: Date;
  // Sleep
  sleepBedtime: Date | null;
  sleepWakeup: Date | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  sleepNote: string | null;
  // Energy
  energy: number | null;
  mood: number | null;
  emotions: JsonValue | null;
  weight: number | null;
  energyNote: string | null;
  // Evening Energy
  eveningEnergy: number | null;
  // Nutrition
  nutrition: number | null;
  nutritionNote: string | null;
  // Routines
  morningRoutine: JsonValue | null;
  eveningRoutine: JsonValue | null;
  routineNote: string | null;
  // Reflection
  winToday: string | null;
  improveTomorrow: string | null;
  gratitude: string | null;
  brainDump: string | null;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDailyEntryInput {
  date: string;
  // Sleep
  sleepBedtime?: string | null;
  sleepWakeup?: string | null;
  sleepHours?: number | null;
  sleepQuality?: number | null;
  sleepNote?: string | null;
  // Energy
  energy?: number | null;
  mood?: number | null;
  emotions?: string[] | null;
  weight?: number | null;
  energyNote?: string | null;
  // Evening Energy
  eveningEnergy?: number | null;
  // Nutrition
  nutrition?: number | null;
  nutritionNote?: string | null;
  // Routines
  morningRoutine?: RoutineMap | null;
  eveningRoutine?: RoutineMap | null;
  routineNote?: string | null;
  // Reflection
  winToday?: string | null;
  improveTomorrow?: string | null;
  gratitude?: string | null;
  brainDump?: string | null;
}

//
// --- Habit ---
//
export interface HabitData {
  id: string;
  name: string;
  icon: string;
  color: string;
  anchor?: string | null;
  action?: string | null;
  celebration?: string | null;
  reminderTime?: string | null;
  archived: boolean;
  order: number;
  completions: HabitCompletionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletionData {
  id: string;
  date: Date;
  habitId: string;
}

export interface UpsertHabitInput {
  id?: string;
  name: string;
  icon?: string;
  color?: string;
  anchor?: string;
  action?: string;
  celebration?: string | null;
  reminderTime?: string | null;
  order?: number;
  archived?: boolean;
}
