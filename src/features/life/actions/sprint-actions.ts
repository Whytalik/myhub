"use server";

import * as sprintService from "../services/sprint-service";
import { invalidateTaskCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";

export async function createProjectAction(
  title: string,
  description?: string,
  objectiveId?: string | null
): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
    const project = await sprintService.createProject(userId, title, description, objectiveId);
    invalidateTaskCache(userId);
    return project;
  });
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sprintService.deleteProject(userId, projectId);
    invalidateTaskCache(userId);
  });
}

export async function updateProjectStatusAction(
  projectId: string,
  status: any
): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
    const project = await sprintService.updateProjectStatus(userId, projectId, status);
    invalidateTaskCache(userId);
    return project;
  });
}

export async function assignProjectToObjectiveAction(
  projectId: string,
  objectiveId: string | null
): Promise<ActionResult<any>> {
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
  description?: string
): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
    const objective = await sprintService.createSprintObjective(userId, sprintId, title, sphereId, description);
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
    kaizenVector?: any;
  }
): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
    const date = new Date(dateString);
    const review = await sprintService.saveSprintReview(userId, sprintId, weekNumber, date, data);
    return review;
  });
}

export async function updateProjectAction(
  projectId: string,
  title: string,
  description?: string
): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
    const project = await sprintService.updateProject(userId, projectId, title, description || null);
    invalidateTaskCache(userId);
    return project;
  });
}

export async function updateSprintObjectiveAction(
  objectiveId: string,
  title: string,
  sphereId: string,
  description?: string
): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
     const objective = await sprintService.updateSprintObjective(userId, objectiveId, title, sphereId, description || null);
     invalidateTaskCache(userId);
     return objective;
  });
}

export async function getCurrentSprintProjectsAction(): Promise<ActionResult<any>> {
  return withAction(async (userId) => {
    return await sprintService.getCurrentSprintProjects(userId);
  });
}

export async function updateSprintDatesAction(
  sprintId: string,
  startDate: string,
  endDate: string,
): Promise<ActionResult<any>> {
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
