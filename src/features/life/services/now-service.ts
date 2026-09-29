import { differenceInCalendarDays, startOfDay } from "date-fns";
import { weeklyReviewRepository } from "../repositories/weekly-review.repository";
import type { NowSummary } from "../types";
import * as goalPlaybookService from "./goal-playbook-service";
import * as sphereGoalService from "./sphere-goal-service";
import * as sprintService from "./sprint-service";
import * as taskService from "./task-service";
import * as weeklyReviewService from "./weekly-review-service";
import * as yearFocusService from "./year-focus-service";

const INBOX_STATUS_NAMES = ["inbox", "інбокс", "беклог", "backlog", "вхідні"];
const TODAY_TASK_LIMIT = 5;

export async function getNowSummary(userId: string): Promise<NowSummary> {
  const now = new Date();
  const today = startOfDay(now);
  const year = now.getFullYear();

  const [sprint, focus, focusRow, goals, reviewDue, tasks, overdueCount, inboxCount] =
    await Promise.all([
      sprintService.getActiveSprint(userId),
      goalPlaybookService.getFocusSummary(userId),
      yearFocusService.getFocus(userId, year),
      sphereGoalService.getGoalsForYear(userId, year),
      weeklyReviewService.getReviewDueState(userId),
      taskService.getTasksByDate(userId, today),
      weeklyReviewRepository.countOverdueAtoms(userId, today),
      weeklyReviewRepository.countInboxThoughts(userId, INBOX_STATUS_NAMES),
    ]);

  const [setup, reviews] = await Promise.all([
    goalPlaybookService.getSetupProgress(userId, goals.length, focusRow !== null),
    weeklyReviewRepository.findReviews(sprint.id),
  ]);

  const openTasks = tasks.filter((task) => task.status !== "DONE" && task.status !== "CANCELLED");
  const latestPriorities =
    [...reviews]
      .reverse()
      .map((review) => weeklyReviewService.readPriorities(review.kaizenVector))
      .find((priorities) => priorities.length > 0) ?? [];

  return {
    focus,
    setup,
    reviewDue: { isDue: reviewDue.isDue, weekStart: reviewDue.weekStart },
    sprint: {
      number: sprint.number,
      weekNumber: weeklyReviewService.getWeekNumber(sprint.startDate, today),
      daysLeft: Math.max(0, differenceInCalendarDays(new Date(sprint.endDate), today)),
    },
    todayTasks: openTasks
      .sort((first, second) => Number(second.isFrog) - Number(first.isFrog))
      .slice(0, TODAY_TASK_LIMIT)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        isFrog: task.isFrog,
      })),
    todayOpenCount: openTasks.length,
    overdueCount,
    priorities: latestPriorities,
    inboxCount,
  };
}
