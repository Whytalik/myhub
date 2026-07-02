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
  isActive: boolean;
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
  isBlocked: boolean;
  isFrog: boolean;
  plannedDate: Date | null;
  hasPlannedTime: boolean;
  plannedEndDate: Date | null;
  hasPlannedEndTime: boolean;
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
  carriedFromDate: Date | null;
  carryOverReason: string | null;
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
  isBlocked?: boolean;
  isFrog?: boolean;
  plannedDate?: string | null;
  hasPlannedTime?: boolean;
  plannedEndDate?: string | null;
  hasPlannedEndTime?: boolean;
  dueDate?: string | null;
  hasDueTime?: boolean;
  parentId?: string | null;
  sphereId?: string | null;
  projectId?: string | null;
  carriedFromDate?: string | null;
  carryOverReason?: string | null;
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
  standupDone: string | null;
  standupPlan: string | null;
  standupBlockers: string | null;
  // Day lifecycle
  startedAt: Date | null;
  completedAt: Date | null;
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
  standupDone?: string | null;
  standupPlan?: string | null;
  standupBlockers?: string | null;
}

//
// --- Habit ---
//
export type SphereLevel = "MINIMUM" | "MEDIUM" | "DESIRED";

export interface HabitData {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  anchor?: string | null;
  action?: string | null;
  celebration?: string | null;
  reminderTime?: string | null;
  archived: boolean;
  order: number;
  targetDaysPerWeek: number;
  sphereId?: string | null;
  sphereLevel?: SphereLevel | null;
  subcategory?: string | null;
  completions: HabitCompletionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletionData {
  id: string;
  date: Date;
  habitId: string;
}

// --- Week Template ---
export type DayType = "regular" | "train_am" | "train_pm";

export interface DayScheduleData {
  id: string;
  dayOfWeek: number; // 0=Mon..6=Sun
  dayType: DayType;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDayScheduleInput {
  dayOfWeek: number; // 0=Mon..6=Sun
  dayType: DayType;
}

//
// --- Weekly Review ---
//
export interface ReviewEntryData {
  id: string;
  date: Date;
  energy: number | null;
  mood: number | null;
  eveningEnergy: number | null;
  weight: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  nutrition: number | null;
  morningRoutine: JsonValue | null;
  eveningRoutine: JsonValue | null;
  recoveryRoutine: JsonValue | null;
  recoveryScore: number | null;
  emotions: JsonValue | null;
  winToday: string | null;
  improveTomorrow: string | null;
  gratitude: string | null;
  completedAt: Date | null;
}

export interface WeekRange {
  start: Date;
  end: Date; // exclusive
}

export interface EmotionBalance {
  positiveCount: number;
  negativeCount: number;
  ratio: number | null; // positive / (positive + negative)
  top: { label: string; count: number; positive: boolean }[];
}

export interface WeekSummary {
  range: WeekRange;
  daysLogged: number;
  daysCompleted: number;
  avgMood: number | null;
  avgEnergy: number | null;
  avgEveningEnergy: number | null;
  avgSleepHours: number | null;
  avgSleepQuality: number | null;
  avgWeight: number | null;
  avgRecoveryScore: number | null;
  nutritionAdherencePct: number | null;
  morningRoutinePct: number | null;
  eveningRoutinePct: number | null;
  recoveryRoutinePct: number | null;
  habitsAdherencePct: number | null;
  tasksCompleted: number;
  tasksCarriedOver: number;
  frogsCompleted: number;
  emotionBalance: EmotionBalance;
  wins: string[];
  gratitudeNotes: string[];
  improvements: string[];
}

export type MetricDirection = "up" | "down" | "flat" | "unknown";

export interface MetricComparison {
  key: string;
  label: string;
  unit?: string;
  current: number | null;
  previous: number | null;
  delta: number | null;
  direction: MetricDirection;
}

export type PatternStrength = "weak" | "moderate" | "strong";

export interface Pattern {
  id: string;
  labelA: string;
  labelB: string;
  r: number;
  n: number;
  strength: PatternStrength;
  description: string;
}

export interface WeeklyTrendPoint {
  weekStart: Date;
  value: number | null;
}

//
// --- Habit ---
//
export interface UpsertHabitInput {
  id?: string;
  name: string;
  type?: string;
  icon?: string;
  color?: string;
  anchor?: string;
  action?: string;
  celebration?: string | null;
  reminderTime?: string | null;
  order?: number;
  archived?: boolean;
  targetDaysPerWeek?: number;
  sphereId?: string | null;
  sphereLevel?: SphereLevel | null;
  subcategory?: string | null;
}
