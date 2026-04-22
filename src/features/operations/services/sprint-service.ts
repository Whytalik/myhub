import { prisma } from "@/lib/prisma";
import type { 
  SprintData, 
  ObjectiveData, 
  KeyResultData, 
  ProjectData, 
  TacticData, 
  UpsertSprintInput,
  UpsertObjectiveInput,
  UpsertKeyResultInput,
  UpsertTacticInput
} from "../types";

// ─── Mapping Functions ───────────────────────────────────────────────────────

function mapTactic(t: any): TacticData {
  return {
    id: t.id,
    keyResultId: t.keyResultId,
    title: t.title,
    description: t.description,
    frequency: t.frequency,
    completions: t.completions,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function mapKeyResult(kr: any): KeyResultData {
  const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
  return {
    id: kr.id,
    objectiveId: kr.objectiveId,
    title: kr.title,
    targetValue: kr.targetValue,
    currentValue: kr.currentValue,
    unit: kr.unit,
    progress: Math.min(progress, 100),
    tactics: kr.tactics?.map(mapTactic) ?? [],
    createdAt: kr.createdAt,
    updatedAt: kr.updatedAt,
  };
}

function mapProject(p: any): ProjectData {
  const taskCount = p.tasks?.length ?? 0;
  const completedTaskCount = p.tasks?.filter((t: any) => t.status === 'DONE').length ?? 0;
  const progress = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;
  
  return {
    id: p.id,
    objectiveId: p.objectiveId,
    title: p.title,
    description: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    status: p.status,
    taskCount,
    completedTaskCount,
    progress,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function mapObjective(obj: any): ObjectiveData {
  return {
    id: obj.id,
    sprintId: obj.sprintId,
    sphereId: obj.sphereId,
    sphereName: obj.sphere?.name,
    sphereColor: obj.sphere?.color,
    title: obj.title,
    description: obj.description,
    status: obj.status,
    keyResults: obj.keyResults?.map(mapKeyResult) ?? [],
    projects: obj.projects?.map(mapProject) ?? [],
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

function mapSprint(s: any): SprintData {
  return {
    id: s.id,
    number: s.number,
    year: s.year,
    startDate: s.startDate,
    endDate: s.endDate,
    status: s.status,
    objectives: s.objectives?.map(mapObjective) ?? [],
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

// ─── Sprints ──────────────────────────────────────────────────────────────────

export async function getAllSprints(personId: string): Promise<SprintData[]> {
  const sprints = await prisma.sprint.findMany({
    where: { personId },
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

export async function getActiveSprint(personId: string): Promise<SprintData | null> {
  const sprint = await prisma.sprint.findFirst({
    where: { personId, status: "ACTIVE" },
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

export async function upsertSprint(personId: string, input: UpsertSprintInput): Promise<SprintData> {
  const { id, number, year, startDate, endDate, status } = input;
  
  const saved = await prisma.sprint.upsert({
    where: { id: id ?? "" },
    create: { personId, number, year, startDate, endDate, status: status ?? "PLANNED" },
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

export async function upsertObjective(personId: string, input: UpsertObjectiveInput): Promise<ObjectiveData> {
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

export async function deleteObjective(personId: string, id: string): Promise<void> {
  // Check ownership through sprint
  const obj = await prisma.objective.findUnique({
    where: { id },
    include: { sprint: true }
  });
  
  if (obj && obj.sprint.personId === personId) {
    await prisma.objective.delete({ where: { id } });
  }
}

// ─── Key Results ──────────────────────────────────────────────────────────────

export async function upsertKeyResult(personId: string, input: UpsertKeyResultInput): Promise<KeyResultData> {
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

export async function upsertTactic(personId: string, input: UpsertTacticInput): Promise<TacticData> {
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
