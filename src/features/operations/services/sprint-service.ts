import { prisma } from "@/lib/prisma";
import { TacticFrequency, TaskStatus, ObjectiveStatus, SprintStatus } from "@/app/generated/prisma";
import type { 
  SprintData, 
  ObjectiveData, 
  KeyResultData, 
  ProjectData, 
  TacticData, 
  TacticCompletionData,
  UpsertSprintInput,
  UpsertObjectiveInput,
  UpsertKeyResultInput,
  UpsertTacticInput
} from "../types";

// ─── Mapping Functions ───────────────────────────────────────────────────────

function mapTactic(t: Record<string, unknown>): TacticData {
  return {
    id: t.id as string,
    keyResultId: t.keyResultId as string,
    title: t.title as string,
    description: (t.description as string) || null,
    frequency: t.frequency as TacticFrequency,
    completions: t.completions as TacticCompletionData[],
    createdAt: t.createdAt as Date,
    updatedAt: t.updatedAt as Date,
  };
}

function mapKeyResult(kr: Record<string, unknown>): KeyResultData {
  const targetValue = kr.targetValue as number;
  const currentValue = kr.currentValue as number;
  const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  return {
    id: kr.id as string,
    objectiveId: kr.objectiveId as string,
    title: kr.title as string,
    targetValue,
    currentValue,
    unit: kr.unit as string,
    progress: Math.min(progress, 100),
    tactics: (kr.tactics as Record<string, unknown>[] | undefined)?.map(mapTactic) ?? [],
    createdAt: kr.createdAt as Date,
    updatedAt: kr.updatedAt as Date,
  };
}

function mapProject(p: Record<string, unknown>): ProjectData {
  const tasks = p.tasks as Array<Record<string, unknown>> | undefined;
  const taskCount = tasks?.length ?? 0;
  const completedTaskCount = tasks?.filter(t => t.status === 'DONE').length ?? 0;
  const progress = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;
  
  return {
    id: p.id as string,
    objectiveId: p.objectiveId as string,
    title: p.title as string,
    description: p.description as string | null,
    startDate: p.startDate as Date | null,
    endDate: p.endDate as Date | null,
    status: p.status as TaskStatus,
    taskCount,
    completedTaskCount,
    progress,
    createdAt: p.createdAt as Date,
    updatedAt: p.updatedAt as Date,
  };
}

function mapObjective(obj: Record<string, unknown>): ObjectiveData {
  return {
    id: obj.id as string,
    sprintId: obj.sprintId as string,
    sphereId: obj.sphereId as string,
    sphereName: (obj.sphere as { name?: string })?.name,
    sphereColor: (obj.sphere as { color?: string })?.color,
    title: obj.title as string,
    description: obj.description as string | null,
    status: obj.status as ObjectiveStatus,
    keyResults: (obj.keyResults as Record<string, unknown>[] | undefined)?.map(mapKeyResult) ?? [],
    projects: (obj.projects as Record<string, unknown>[] | undefined)?.map(mapProject) ?? [],
    createdAt: obj.createdAt as Date,
    updatedAt: obj.updatedAt as Date,
  };
}

function mapSprint(s: Record<string, unknown>): SprintData {
  return {
    id: s.id as string,
    number: s.number as number,
    year: s.year as number,
    startDate: s.startDate as Date,
    endDate: s.endDate as Date,
    status: s.status as SprintStatus,
    objectives: (s.objectives as Record<string, unknown>[] | undefined)?.map(mapObjective) ?? [],
    createdAt: s.createdAt as Date,
    updatedAt: s.updatedAt as Date,
  };
}

// ─── Sprints ──────────────────────────────────────────────────────────────────

export async function getAllSprints(userId: string): Promise<SprintData[]> {
  const sprints = await prisma.sprint.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { number: "desc" }],
    include: {
      objectives: {
        include: {
          sphere: true,
          keyResults: {
            include: {
              tactics: {
                include: { completions: true }
              }
            }
          },
          projects: {
            include: { tasks: true }
          }
        }
      }
    }
  });
  return sprints.map(mapSprint);
}

export async function getActiveSprint(userId: string): Promise<SprintData | null> {
  const sprint = await prisma.sprint.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      objectives: {
        include: {
          sphere: true,
          keyResults: {
            include: {
              tactics: {
                include: { completions: true }
              }
            }
          },
          projects: {
            include: { tasks: true }
          }
        }
      }
    }
  });
  return sprint ? mapSprint(sprint) : null;
}

export async function upsertSprint(userId: string, input: UpsertSprintInput): Promise<SprintData> {
  const { id, number, year, startDate, endDate, status } = input;
  
  const saved = await prisma.sprint.upsert({
    where: { id: id ?? "" },
    create: { userId, number, year, startDate, endDate, status: status ?? "PLANNED" },
    update: { number, year, startDate, endDate, status },
    include: {
      objectives: {
        include: {
          sphere: true,
          keyResults: {
            include: {
              tactics: {
                include: { completions: true }
              }
            }
          },
          projects: {
            include: { tasks: true }
          }
        }
      }
    }
  });
  return mapSprint(saved);
}

// ─── Objectives ───────────────────────────────────────────────────────────────

export async function upsertObjective(userId: string, input: UpsertObjectiveInput): Promise<ObjectiveData> {
  const { id, sprintId, sphereId, title, description, status } = input;
  
  const saved = await prisma.objective.upsert({
    where: { id: id ?? "" },
    create: { sprintId, sphereId, title, description, status: status ?? "IN_PROGRESS" },
    update: { sphereId, title, description, status },
    include: {
      sphere: true,
      keyResults: {
        include: {
          tactics: {
            include: { completions: true }
          }
        }
      },
      projects: {
        include: { tasks: true }
      }
    }
  });
  return mapObjective(saved);
}

export async function deleteObjective(userId: string, id: string): Promise<void> {
  // Check ownership through sprint
  const obj = await prisma.objective.findUnique({
    where: { id },
    include: { sprint: true }
  });
  
  if (obj && obj.sprint.userId === userId) {
    await prisma.objective.delete({ where: { id } });
  }
}

// ─── Key Results ──────────────────────────────────────────────────────────────

export async function upsertKeyResult(userId: string, input: UpsertKeyResultInput): Promise<KeyResultData> {
  const { id, objectiveId, title, targetValue, currentValue, unit } = input;
  
  const saved = await prisma.keyResult.upsert({
    where: { id: id ?? "" },
    create: { objectiveId, title, targetValue, currentValue: currentValue ?? 0, unit },
    update: { title, targetValue, currentValue, unit },
    include: {
      tactics: {
        include: { completions: true }
      }
    }
  });
  return mapKeyResult(saved);
}

export async function updateKRValue(id: string, value: number): Promise<void> {
  await prisma.keyResult.update({
    where: { id },
    data: { currentValue: value }
  });
}

// ─── Tactics ──────────────────────────────────────────────────────────────────

export async function upsertTactic(userId: string, input: UpsertTacticInput): Promise<TacticData> {
  const { id, keyResultId, title, description, frequency } = input;
  
  const saved = await prisma.tactic.upsert({
    where: { id: id ?? "" },
    create: { keyResultId, title, description, frequency: frequency ?? "WEEKLY" },
    update: { title, description, frequency },
    include: { completions: true }
  });
  return mapTactic(saved);
}

export async function toggleTacticCompletion(tacticId: string, weekNumber: number, completed: boolean): Promise<void> {
  if (completed) {
    await prisma.tacticCompletion.upsert({
      where: { tacticId_weekNumber: { tacticId, weekNumber } },
      create: { tacticId, weekNumber, completed: true },
      update: { completed: true }
    });
  } else {
    await prisma.tacticCompletion.deleteMany({
      where: { tacticId, weekNumber }
    });
  }
}
