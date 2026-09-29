import type {
  TaskStatus as PrismaTaskStatus,
  TaskPriority as PrismaTaskPriority,
  Prisma,
} from "@/app/generated/prisma";
import type { RoutineMap } from "@/lib/life/routine-items";
import type { ThoughtType } from "./logic/thought-types";

type JsonValue = Prisma.JsonValue;

export type TaskStatus = PrismaTaskStatus;
export type TaskPriority = PrismaTaskPriority;

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

export type DirectionAction = {
  label: string;
  text: string;
};

export interface DirectionData {
  id: string;
  sphereId: string;
  sphereName: string;
  sphereColor: string;
  sphereIcon: string;
  statement: string;
  actions: DirectionAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDirectionInput {
  sphereId: string;
  statement: string;
  actions?: DirectionAction[];
}

export type SphereGoalType = "COUNTER" | "DAYS" | "VALUE";

export const MAX_GOALS_PER_SPHERE = 5;
export const MIN_GOALS_PER_SPHERE = 3;

export interface SphereGoalData {
  id: string;
  sphereId: string;
  year: number;
  title: string;
  type: SphereGoalType;
  unit: string | null;
  startValue: number;
  targetValue: number;
  currentValue: number;
  // True when currentValue is derived from a habit's completions.
  isAutoTracked: boolean;
  habitId: string | null;
  habitName: string | null;
  order: number;
  // 0-100, how much of the way from startValue to targetValue is done.
  progressPercent: number;
  // 0-100, share of the year that has passed; null for past/future years.
  expectedPercent: number | null;
}

// A yearly goal seen through the current sprint: the sprint's share of the
// target and how much of it has been done since the sprint started.
export interface SprintGoalProgress {
  goalId: string;
  sphereId: string;
  title: string;
  type: SphereGoalType;
  unit: string | null;
  sprintTarget: number;
  sprintValue: number;
  sprintPercent: number;
  yearlyCurrent: number;
  yearlyTarget: number;
  yearlyPercent: number;
}

export interface YearFocusData {
  id: string;
  year: number;
  sphereId: string;
  leverGoalId: string | null;
  leverReason: string | null;
  allowImperfect: string | null;
}

export interface SetYearFocusInput {
  year: number;
  sphereId: string;
  leverGoalId?: string | null;
  leverReason?: string | null;
  allowImperfect?: string | null;
}

export interface UpsertSphereGoalInput {
  id?: string;
  sphereId?: string;
  year?: number;
  title?: string;
  type?: SphereGoalType;
  unit?: string | null;
  startValue?: number;
  targetValue?: number;
  habitId?: string | null;
}

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
  resistance: number | null;
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
  resistance?: number | null;
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

export interface DailyEntryData {
  id: string;
  date: Date;

  sleepBedtime: Date | null;
  sleepWakeup: Date | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  sleepNote: string | null;

  energy: number | null;
  mood: number | null;
  emotions: JsonValue | null;
  weight: number | null;
  energyNote: string | null;

  eveningEnergy: number | null;
  eveningMood: number | null;

  nutrition: number | null;
  nutritionNote: string | null;

  morningRoutine: JsonValue | null;
  eveningRoutine: JsonValue | null;
  routineNote: string | null;
  trainingDayName: string | null;
  gymSkipped: boolean;
  gymSkipReason: string | null;

  winToday: string | null;
  improveTomorrow: string | null;
  gratitude: string | null;
  frictionToday: string | null;
  confidenceLog: JsonValue | null;
  postAnalysisTrigger: string | null;
  postAnalysisMyReaction: string | null;
  postAnalysisBetterResponse: string | null;
  standupPlan: string | null;
  dailyVector: JsonValue | null;
  pdcaLog: JsonValue | null;

  startedAt: Date | null;
  completedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDailyEntryInput {
  date: string;

  sleepBedtime?: string | null;
  sleepWakeup?: string | null;
  sleepHours?: number | null;
  sleepQuality?: number | null;
  sleepNote?: string | null;

  energy?: number | null;
  mood?: number | null;
  emotions?: string[] | null;
  weight?: number | null;
  energyNote?: string | null;

  eveningEnergy?: number | null;
  eveningMood?: number | null;

  nutrition?: number | null;
  nutritionNote?: string | null;

  morningRoutine?: RoutineMap | null;
  eveningRoutine?: RoutineMap | null;
  routineNote?: string | null;
  trainingDayName?: string | null;
  gymSkipped?: boolean;
  gymSkipReason?: string | null;

  winToday?: string | null;
  improveTomorrow?: string | null;
  gratitude?: string | null;
  frictionToday?: string | null;
  standupPlan?: string | null;
  confidenceLog?: ConfidenceLog | null;
  dailyVector?: DailyVector | null;
  pdcaLog?: PdcaLog | null;
  postAnalysisTrigger?: string | null;
  postAnalysisMyReaction?: string | null;
  postAnalysisBetterResponse?: string | null;
}

export interface ConfidenceLog {
  ladderLevel: number | null;
  initAttempts: number | null;
  usedBoundaryPhrase: boolean | null;
  boundaryPhraseText: string | null;
  stuporSituation: string | null;
  stuporThought: string | null;
  stuporReality: string | null;
  floodingUsedPause: boolean | null;
  note: string | null;
}

// Daily PDCA (Plan→Do→Check→Act) reflection log — stored per evening entry
export interface PdcaLog {
  plan: string | null;
  do: string | null;
  check: string | null;
  act: string | null;
}

// Morning "vector of the day" prompt set — a periodic self-audit ritual
// (improve/do/efficiency/effort/automate/delegate/fix), distinct from the
// nightly retrospective in ReflectionSection.
export interface DailyVector {
  toImprove: string | null;
  toDo: string | null;
  toIncreaseEfficiency: string | null;
  toReduceEffort: string | null;
  toAutomate: string | null;
  toDelegate: string | null;
  toFix: string | null;
}

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
  scheduledWeekdays: number[];
  sphereId?: string | null;
  sphereLevel?: SphereLevel | null;
  subcategory?: string | null;
  chainId?: string | null;
  ifThenPlan?: string | null;
  frictionReduction?: string | null;
  identityStatement?: string | null;
  minimalThreshold?: string | null;
  copingPlan?: string | null;
  completions: HabitCompletionData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletionData {
  id: string;
  date: Date;
  habitId: string;
}

export interface HabitChainData {
  id: string;
  name: string;
  description?: string | null;
  order: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertHabitChainInput {
  id?: string;
  name: string;
  description?: string | null;
  order?: number;
  archived?: boolean;
}

export interface ReorderHabitsInput {
  chainId: string;
  orderedHabitIds: string[];
}

export interface ContextBlock {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  bufferMinutes: number;
  sphereNames: string[]; // Spheres mapped to this block, e.g. ["Sport", "Health"]
  enabled?: boolean;
}

export interface DayScheduleData {
  id: string;
  dayOfWeek: number;
  trainingDayId: string | null;
  trainingDayName: string | null;
  contextBlocks: ContextBlock[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertDayScheduleInput {
  dayOfWeek: number;
  trainingDayId: string | null;
  contextBlocks?: ContextBlock[] | null;
}

export interface ThoughtData {
  id: string;
  statusId: string;
  content: string;
  order: number;
  type: ThoughtType | null;
  templateData: Record<string, string> | null;
  sphereId: string | null;
  sphere: LifeSphereData | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThoughtStatusData {
  id: string;
  name: string;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  thoughts: ThoughtData[];
}

export interface UpsertThoughtStatusInput {
  id?: string;
  name?: string;
  color?: string;
  order?: number;
}

export type SprintObjectiveOutcome = "ACHIEVED" | "PARTIAL" | "FAILED" | "CANCELLED";

// What happens to an unfinished project when its sprint is closed.
export type ProjectClosureAction = "CARRY" | "BACKLOG" | "DONE" | "CANCELLED";

export interface SprintClosureInput {
  sprintId: string;
  objectives: {
    objectiveId: string;
    outcome: SprintObjectiveOutcome;
    projects: { projectId: string; action: ProjectClosureAction }[];
  }[];
  afterAction: {
    whatWorked?: string;
    challenges?: string;
    adjustments?: string;
  };
}

export interface PendingSprintClosure {
  sprint: { id: string; number: number; year: number; startDate: Date; endDate: Date };
  summary: {
    objectivesTotal: number;
    projectsDone: number;
    projectsTotal: number;
    tasksDone: number;
    tasksTotal: number;
    averageScore: number | null;
    reviewCount: number;
  };
  objectives: {
    id: string;
    title: string;
    description: string | null;
    sphere: { id: string; name: string; color: string; icon: string };
    // Only projects that are still open (not DONE / CANCELLED).
    unfinishedProjects: { id: string; title: string; openTaskCount: number }[];
  }[];
}

export interface UpsertThoughtInput {
  id?: string;
  statusId?: string;
  content?: string;
  order?: number;
  type?: ThoughtType | null;
  templateData?: Record<string, string> | null;
  sphereId?: string | null;
}

export interface UpsertHabitInput {
  id?: string;
  name?: string;
  type?: string;
  icon?: string;
  color?: string;
  anchor?: string;
  action?: string;
  celebration?: string | null;
  reminderTime?: string | null;
  order?: number;
  archived?: boolean;
  scheduledWeekdays?: number[];
  sphereId?: string | null;
  chainId?: string | null;
  identityStatement?: string | null;
  minimalThreshold?: string | null;
}
