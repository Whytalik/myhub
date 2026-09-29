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
  // ISO date or null.
  deadline: string | null;
  createdAt: string;
  order: number;
  // 0-100, how much of the way from startValue to targetValue is done.
  progressPercent: number;
  // 0-100, share of the year that has passed; null for past/future years.
  expectedPercent: number | null;
}

// A yearly goal seen through the current sprint: the sprint's share of the
// target and how much of it has been done since the sprint started.
export interface SprintGoalProgress {
  sliceId: string;
  goalId: string;
  sphereId: string;
  title: string;
  type: SphereGoalType;
  unit: string | null;
  sprintTarget: number;
  sprintValue: number;
  sprintPercent: number;
  // What has to be done per remaining week of the sprint to reach the sprint target.
  perWeekNeeded: number | null;
  yearlyCurrent: number;
  yearlyTarget: number;
  yearlyPercent: number;
}

export interface YearFocusData {
  id: string;
  year: number;
  sphereId: string;
  identity: string | null;
  leverGoalId: string | null;
  leverReason: string | null;
  allowImperfect: string | null;
}

// "Votes" for the identity: completed habit days and finished atoms in the focus sphere.
export interface IdentityVotes {
  total: number;
  week: number;
  today: number;
  yesterday: number;
}

export interface SetYearFocusInput {
  year: number;
  sphereId: string;
  identity?: string | null;
  leverGoalId?: string | null;
  leverReason?: string | null;
  allowImperfect?: string | null;
}

export interface PlaybookObstacle {
  obstacle: string;
  solution: string;
}

export interface PlaybookPerson {
  name: string;
  help: string;
}

export interface GoalPhaseData {
  id: string;
  title: string;
  startMonth: number;
  endMonth: number;
  outcome: string | null;
  order: number;
  done: boolean;
}

export interface PlaybookAtom {
  id: string;
  title: string;
  status: TaskStatus;
  plannedDate: string | null;
  hasPlannedTime: boolean;
  plannedEndDate: string | null;
  projectId: string;
  projectTitle: string;
}

export interface PlaybookProject {
  id: string;
  title: string;
  status: TaskStatus;
  isLinked: boolean;
}

export const PLAYBOOK_STEP_COUNT = 12;

export interface GoalPlaybookData {
  id: string;
  goalId: string;
  path: string;
  keyChange: string;
  assets: string[];
  obstacles: PlaybookObstacle[];
  people: PlaybookPerson[];
  pedalAction: string;
  pedalTask: { id: string; title: string; status: TaskStatus } | null;
  phases: GoalPhaseData[];
  currentPhaseId: string | null;
  projects: PlaybookProject[];
  monthAtoms: { done: number; total: number };
  weekAtoms: PlaybookAtom[];
  // One flag per step of the 12-step system, in order.
  stepDone: boolean[];
}

export interface SavePlaybookInput {
  path?: string;
  keyChange?: string;
  assets?: string[];
  obstacles?: PlaybookObstacle[];
  people?: PlaybookPerson[];
  pedalAction?: string;
}

export interface UpsertGoalPhaseInput {
  id?: string;
  title: string;
  startMonth: number;
  endMonth: number;
  outcome?: string | null;
}

// What the daily Journal shows about the year's focus.
export interface FocusSummary {
  sphere: { name: string; color: string; icon: string };
  leverGoal: SphereGoalData | null;
  pedalTask: { id: string; title: string; status: TaskStatus } | null;
  identity: string | null;
  votes: IdentityVotes | null;
  // A tiny version of a habit to fall back on, shown after a missed day.
  minimumAction: string | null;
}

export interface SetupProgress {
  hasGoals: boolean;
  hasFocus: boolean;
  hasPlaybook: boolean;
  hasLinkedObjectives: boolean;
}

export type MissedReason = "NO_TIME" | "RESISTANCE" | "UNCLEAR" | "BLOCKED" | "NOT_IMPORTANT";

export const WEEKLY_EXECUTION_TARGET = 85;

export interface WeeklyReviewAtom {
  id: string;
  title: string;
  status: TaskStatus;
  plannedDate: string | null;
  hasPlannedTime: boolean;
  plannedEndDate: string | null;
  sphereId: string | null;
  projectId: string | null;
  projectTitle: string | null;
  carryOverReason: string | null;
}

// Structured extras stored in SprintReview.kaizenVector.
export interface WeeklyReviewExtras {
  executionPercent: number | null;
  missedReasons: Record<string, MissedReason>;
  priorities: string[];
}

export interface WeeklyReviewData {
  sprint: { id: string; number: number };
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  nextWeekStart: string;
  execution: {
    planned: number;
    done: number;
    percent: number | null;
    bySphere: { sphereId: string | null; planned: number; done: number }[];
    focusSphereId: string | null;
    focusPlanned: number;
    focusDone: number;
  };
  // Planned this week but not finished.
  missed: WeeklyReviewAtom[];
  // Open atoms planned before today (carry-over candidates).
  overdue: WeeklyReviewAtom[];
  goals: SprintGoalProgress[];
  manualGoals: SphereGoalData[];
  leverGoal: SphereGoalData | null;
  pedalTask: { id: string; title: string; status: TaskStatus } | null;
  identity: { statement: string; votesWeek: number; votesTotal: number } | null;
  journal: {
    entries: {
      date: string;
      winToday: string | null;
      improveTomorrow: string | null;
      frictionToday: string | null;
      gratitude: string | null;
    }[];
    avgEnergy: number | null;
    avgMood: number | null;
    avgSleepHours: number | null;
    entryCount: number;
  };
  inboxCount: number;
  // Open atoms of the sprint that are unscheduled or fall in next week.
  nextWeekAtoms: WeeklyReviewAtom[];
  dailyBudget: number;
  review: {
    score: number | null;
    wins: string;
    challenges: string;
    adjustments: string;
    extras: WeeklyReviewExtras;
  } | null;
  previousKaizen: string | null;
  streak: number;
  history: { weekNumber: number; score: number | null; executionPercent: number | null }[];
}

export interface SaveWeeklyReviewInput {
  weekStart: string;
  score: number;
  wins: string;
  challenges: string;
  adjustments: string;
  extras: WeeklyReviewExtras;
}

export interface WeeklyReviewSettings {
  day: number;
  time: string;
}

// The "what to do now" home screen.
export interface NowSummary {
  focus: FocusSummary | null;
  setup: SetupProgress;
  reviewDue: { isDue: boolean; weekStart: string };
  sprint: { number: number; weekNumber: number; daysLeft: number };
  todayTasks: { id: string; title: string; status: TaskStatus; isFrog: boolean }[];
  todayOpenCount: number;
  overdueCount: number;
  priorities: string[];
  inboxCount: number;
}

// How a sphere is treated in a year. FOCUS is derived from the year focus.
export type SphereRole = "FOCUS" | "ACTIVE" | "MINIMUM" | "OFF";

export interface SphereRoleData {
  sphereId: string;
  role: SphereRole;
  plank: string | null;
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
  // ISO date (yyyy-mm-dd) or null to clear.
  deadline?: string | null;
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
export type HabitRecurrence = "WEEKLY" | "MONTHLY" | "QUARTERLY";

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
  recurrence: HabitRecurrence;
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
  recurrence?: HabitRecurrence;
  sphereId?: string | null;
  chainId?: string | null;
  identityStatement?: string | null;
  minimalThreshold?: string | null;
}
