"use server";

import * as sprintService from "../services/sprint-service";
import { invalidateTaskCache } from "@/lib/cache/revalidate";
import { withAction } from "@/lib/actions/action-utils";
import type { TaskStatus } from "@/features/life/types";

export async function createProjectAction(
  title: string,
  description?: string,
  objectiveId?: string | null,
) {
  return withAction(async (userId) => {
    const project = await sprintService.createProject(userId, title, description, objectiveId);
    invalidateTaskCache(userId);
    return project;
  });
}

export async function deleteProjectAction(projectId: string) {
  return withAction(async (userId) => {
    await sprintService.deleteProject(userId, projectId);
    invalidateTaskCache(userId);
  });
}

export async function updateProjectStatusAction(projectId: string, status: TaskStatus) {
  return withAction(async (userId) => {
    const project = await sprintService.updateProjectStatus(userId, projectId, status);
    invalidateTaskCache(userId);
    return project;
  });
}

export async function assignProjectToObjectiveAction(
  projectId: string,
  objectiveId: string | null,
) {
  return withAction(async (userId) => {
    const project = await sprintService.assignProjectToObjective(userId, projectId, objectiveId);
    invalidateTaskCache(userId);
    return project;
  });
}

export async function createSprintObjectiveAction(
  sprintId: string,
  title: string,
  sphereId: string,
  description?: string,
) {
  return withAction(async (userId) => {
    const objective = await sprintService.createSprintObjective(
      userId,
      sprintId,
      title,
      sphereId,
      description,
    );
    invalidateTaskCache(userId);
    return objective;
  });
}

export async function saveSprintReviewAction(
  sprintId: string,
  weekNumber: number,
  dateString: string,
  data: {
    score?: number;
    wins?: string;
    challenges?: string;
    adjustments?: string;
    kaizenVector?: Parameters<typeof sprintService.saveSprintReview>[4]["kaizenVector"];
  },
) {
  return withAction(async (userId) => {
    const date = new Date(dateString);
    const review = await sprintService.saveSprintReview(userId, sprintId, weekNumber, date, data);
    return review;
  });
}

export async function updateProjectAction(projectId: string, title: string, description?: string) {
  return withAction(async (userId) => {
    const project = await sprintService.updateProject(
      userId,
      projectId,
      title,
      description || null,
    );
    invalidateTaskCache(userId);
    return project;
  });
}

export async function updateSprintObjectiveAction(
  objectiveId: string,
  title: string,
  sphereId: string,
  description?: string,
) {
  return withAction(async (userId) => {
    const objective = await sprintService.updateSprintObjective(
      userId,
      objectiveId,
      title,
      sphereId,
      description || null,
    );
    invalidateTaskCache(userId);
    return objective;
  });
}

export async function getCurrentSprintProjectsAction() {
  return withAction(async (userId) => {
    return await sprintService.getCurrentSprintProjects(userId);
  });
}

export async function updateSprintDatesAction(
  sprintId: string,
  startDate: string,
  endDate: string,
) {
  return withAction(async (userId) => {
    const result = await sprintService.updateSprintDates(
      userId,
      sprintId,
      new Date(startDate),
      new Date(endDate),
    );
    invalidateTaskCache(userId);
    return result;
  });
}
