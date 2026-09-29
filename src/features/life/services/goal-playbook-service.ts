import { endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import {
  goalPlaybookRepository,
  type GoalPlaybookRow,
} from "../repositories/goal-playbook.repository";
import { goalPhaseSchema, savePlaybookSchema } from "../schemas";
import {
  PLAYBOOK_STEP_COUNT,
  type GoalPhaseData,
  type FocusSummary,
  type GoalPlaybookData,
  type PlaybookAtom,
  type PlaybookObstacle,
  type PlaybookPerson,
  type SetupProgress,
  type SavePlaybookInput,
  type TaskStatus,
  type UpsertGoalPhaseInput,
} from "../types";
import { taskRepository } from "../repositories/task.repository";
import * as taskService from "./task-service";
import * as sphereGoalService from "./sphere-goal-service";
import * as yearFocusService from "./year-focus-service";

const FINISHED_TASK_STATUSES: TaskStatus[] = ["DONE", "CANCELLED"];

function readList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapPhase(row: GoalPlaybookRow["phases"][number]): GoalPhaseData {
  return {
    id: row.id,
    title: row.title,
    startMonth: row.startMonth,
    endMonth: row.endMonth,
    outcome: row.outcome,
    order: row.order,
    done: row.done,
  };
}

async function requireGoal(userId: string, goalId: string) {
  if (!(await goalPlaybookRepository.findGoalForUser(goalId, userId))) {
    throw new Error("Goal not found");
  }
}

async function requirePlaybook(userId: string, goalId: string): Promise<GoalPlaybookRow> {
  await requireGoal(userId, goalId);
  return (
    (await goalPlaybookRepository.findByGoal(goalId)) ??
    goalPlaybookRepository.create(userId, goalId)
  );
}

// Which of the 12 steps are complete. Step 1 (the goal itself) always is.
export function getStepDone(input: {
  path: string;
  keyChange: string;
  assets: string[];
  obstacles: PlaybookObstacle[];
  people: PlaybookPerson[];
  phases: GoalPhaseData[];
  currentPhase: GoalPhaseData | null;
  weekAtoms: PlaybookAtom[];
  hasPedalTask: boolean;
}): boolean[] {
  const allObstaclesSolved =
    input.obstacles.length > 0 && input.obstacles.every((item) => item.solution.trim() !== "");
  const activeAtoms = input.weekAtoms.filter(
    (atom) => !FINISHED_TASK_STATUSES.includes(atom.status),
  );

  const steps = [
    true,
    input.path !== "",
    input.keyChange !== "",
    input.assets.length > 0,
    input.obstacles.length > 0,
    allObstaclesSolved,
    input.people.length > 0,
    input.phases.length > 0,
    !!input.currentPhase?.outcome,
    input.weekAtoms.length > 0,
    activeAtoms.length > 0 ? activeAtoms.every((atom) => atom.hasPlannedTime) : false,
    input.hasPedalTask,
  ];
  if (steps.length !== PLAYBOOK_STEP_COUNT) throw new Error("Playbook step count mismatch");
  return steps;
}

export async function getPlaybook(userId: string, goalId: string): Promise<GoalPlaybookData> {
  const playbook = await requirePlaybook(userId, goalId);
  const now = new Date();
  const week = {
    from: startOfWeek(now, { weekStartsOn: 1 }),
    to: endOfWeek(now, { weekStartsOn: 1 }),
  };
  const month = { from: startOfMonth(now), to: endOfMonth(now) };
  const currentMonthNumber = now.getMonth() + 1;

  const [projects, openAtoms, monthTasks, pedalTask] = await Promise.all([
    goalPlaybookRepository.findProjectsForUser(userId),
    goalPlaybookRepository.findOpenLeafTasks(goalId, week.from, week.to),
    goalPlaybookRepository.findLeafTasksInRange(goalId, month.from, month.to),
    playbook.pedalTaskId
      ? goalPlaybookRepository.findTask(playbook.pedalTaskId, userId)
      : Promise.resolve(null),
  ]);

  const phases = playbook.phases.map(mapPhase);
  const currentPhase =
    phases.find(
      (phase) => phase.startMonth <= currentMonthNumber && currentMonthNumber <= phase.endMonth,
    ) ?? null;
  const weekAtoms: PlaybookAtom[] = openAtoms.flatMap((task) =>
    task.projectId
      ? [
          {
            id: task.id,
            title: task.title,
            status: task.status,
            plannedDate: task.plannedDate?.toISOString() ?? null,
            hasPlannedTime: task.hasPlannedTime,
            plannedEndDate: task.plannedEndDate?.toISOString() ?? null,
            projectId: task.projectId,
            projectTitle: task.project?.title ?? "",
          },
        ]
      : [],
  );

  const path = playbook.path ?? "";
  const keyChange = playbook.keyChange ?? "";
  const assets = readList<string>(playbook.assets);
  const obstacles = readList<PlaybookObstacle>(playbook.obstacles);
  const people = readList<PlaybookPerson>(playbook.people);

  return {
    id: playbook.id,
    goalId,
    path,
    keyChange,
    assets,
    obstacles,
    people,
    pedalAction: playbook.pedalAction ?? "",
    pedalTask,
    phases,
    currentPhaseId: currentPhase?.id ?? null,
    projects: projects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      isLinked: project.goalId === goalId,
    })),
    monthAtoms: {
      done: monthTasks.filter((task) => task.status === "DONE").length,
      total: monthTasks.length,
    },
    weekAtoms,
    stepDone: getStepDone({
      path,
      keyChange,
      assets,
      obstacles,
      people,
      phases,
      currentPhase,
      weekAtoms,
      hasPedalTask: pedalTask !== null,
    }),
  };
}

export async function getFocusSummary(userId: string): Promise<FocusSummary | null> {
  const year = new Date().getFullYear();
  const focus = await yearFocusService.getFocus(userId, year);
  if (!focus) return null;

  const [sphere, goals, playbook] = await Promise.all([
    goalPlaybookRepository.findSphere(focus.sphereId),
    sphereGoalService.getGoalsForYear(userId, year),
    focus.leverGoalId ? goalPlaybookRepository.findByGoal(focus.leverGoalId) : null,
  ]);
  if (!sphere) return null;

  const pedalTask = playbook?.pedalTaskId
    ? await goalPlaybookRepository.findTask(playbook.pedalTaskId, userId)
    : null;

  return {
    sphere,
    leverGoal: goals.find((goal) => goal.id === focus.leverGoalId) ?? null,
    pedalTask,
  };
}

export async function getSetupProgress(userId: string, goalCount: number, hasFocus: boolean) {
  const [startedPlaybooks, linkedObjectives] = await Promise.all([
    goalPlaybookRepository.countStartedPlaybooks(userId),
    goalPlaybookRepository.countLinkedObjectives(userId),
  ]);
  return {
    hasGoals: goalCount > 0,
    hasFocus,
    hasPlaybook: startedPlaybooks > 0,
    hasLinkedObjectives: linkedObjectives > 0,
  } satisfies SetupProgress;
}

export async function savePlaybook(
  userId: string,
  goalId: string,
  input: SavePlaybookInput,
): Promise<void> {
  const parsed = savePlaybookSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const playbook = await requirePlaybook(userId, goalId);
  const { path, keyChange, assets, obstacles, people, pedalAction } = parsed.data;
  await goalPlaybookRepository.update(playbook.id, {
    path: path === undefined ? undefined : path || null,
    keyChange: keyChange === undefined ? undefined : keyChange || null,
    assets: assets ?? undefined,
    obstacles: obstacles ?? undefined,
    people: people ?? undefined,
    pedalAction: pedalAction === undefined ? undefined : pedalAction || null,
  });
}

export async function upsertPhase(
  userId: string,
  goalId: string,
  input: UpsertGoalPhaseInput,
): Promise<void> {
  const parsed = goalPhaseSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const playbook = await requirePlaybook(userId, goalId);
  const data = {
    title: parsed.data.title,
    startMonth: parsed.data.startMonth,
    endMonth: parsed.data.endMonth,
    outcome: parsed.data.outcome || null,
  };

  if (input.id) {
    const existing = await goalPlaybookRepository.findPhase(input.id, userId);
    if (!existing || existing.playbookId !== playbook.id) throw new Error("Phase not found");
    await goalPlaybookRepository.updatePhase(input.id, data);
    return;
  }
  const order = await goalPlaybookRepository.countPhases(playbook.id);
  await goalPlaybookRepository.createPhase({ playbookId: playbook.id, order, ...data });
}

export async function deletePhase(userId: string, phaseId: string): Promise<void> {
  if (!(await goalPlaybookRepository.findPhase(phaseId, userId)))
    throw new Error("Phase not found");
  await goalPlaybookRepository.deletePhase(phaseId);
}

export async function togglePhaseDone(userId: string, phaseId: string): Promise<void> {
  const phase = await goalPlaybookRepository.findPhase(phaseId, userId);
  if (!phase) throw new Error("Phase not found");
  await goalPlaybookRepository.updatePhase(phaseId, { done: !phase.done });
}

export async function linkProject(
  userId: string,
  goalId: string,
  projectId: string,
  isLinked: boolean,
): Promise<void> {
  await requireGoal(userId, goalId);
  if (!(await goalPlaybookRepository.findProjectForUser(projectId, userId))) {
    throw new Error("Project not found");
  }
  await goalPlaybookRepository.setProjectGoal(projectId, isLinked ? goalId : null);
}

// Step 12: the one 5-minute action to do right now, as today's frog task.
// The frog is one per user: an unfinished frog is never replaced, the pedal task is
// then a normal task for today. Returns whether the pedal became the frog.
export async function createPedalTask(
  userId: string,
  goalId: string,
): Promise<{ isFrog: boolean }> {
  const playbook = await requirePlaybook(userId, goalId);
  const title = playbook.pedalAction?.trim();
  if (!title) throw new Error("Write the 5-minute action first");

  const task = await taskService.upsertTask(userId, {
    title,
    plannedDate: startOfDay(new Date()).toISOString(),
    priority: "HIGH",
  });
  const hasOpenFrog = (await taskRepository.findOpenFrog(userId)) !== null;
  if (!hasOpenFrog) await taskService.setTaskAsFrog(userId, task.id);
  await goalPlaybookRepository.update(playbook.id, { pedalTaskId: task.id });
  return { isFrog: !hasOpenFrog };
}
