import type { 
  TaskStatus as PrismaTaskStatus,
  TaskPriority as PrismaTaskPriority,
  WishlistStatus as PrismaWishlistStatus,
  Prisma,
} from "@/app/generated/prisma";

type JsonValue = Prisma.JsonValue;
import type { RoutineMap } from "@/lib/routine-items";

//
// --- Base Enums ---
//
export type TaskStatus = PrismaTaskStatus;
export type TaskPriority = PrismaTaskPriority;
export type WishlistStatus = PrismaWishlistStatus;

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
  morningSunlight: boolean | null;
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
  morningSunlight?: boolean | null;
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

//
// --- Stats ---
//
export interface RecentEntry {
  date: Date;
  energy: number | null;
  sleepHours: number | null;
  routineScore: number | null;
}

export interface DailyStats {
  streak: number;
  avgSleep: number | null;
  avgEnergy: number | null;
  avgMood: number | null;
  recentEntries: RecentEntry[];
}

export interface SphereTaskStat {
  id: string;
  name: string;
  color: string;
  count: number;
  completed: number;
}

export interface DayTaskStat {
  date: string;
  created: number;
  completed: number;
}

export interface ProjectProgressStat {
  id: string;
  title: string;
  totalSubtasks: number;
  completedSubtasks: number;
  progress: number;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  onTimeRate: number;
  mostActiveSphere: string | null;
  activeHighPriorityTasks: number;
  avgLeadTimeHours: number | null;
  sphereDistribution: SphereTaskStat[];
  last7Days: DayTaskStat[];
  topProjects: ProjectProgressStat[];
}

export interface HabitStats {
  id: string;
  name: string;
  streak: number;
  totalCompletions: number;
  completionRate: number;
  last7Days: boolean[];
}
