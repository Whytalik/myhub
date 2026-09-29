// Destinations for the Planning Wizard's Primer Filter step (see
// PlanningWizardClient.tsx step 2). Each non-DELETE outcome maps to a real
// ThoughtStatus, created lazily by name the first time it's needed — same
// pattern as the "Inbox" default (thought-service.ts getBoard).
export type FilterOutcome =
  | "KEEP_WANT"
  | "KEEP_MUST"
  | "SOMEDAY"
  | "DELEGATE"
  | "NOT_MINE"
  | "DELETE";

// Answer to the Prime Filter's "when?" question for accepted thoughts
// (KEEP_WANT / KEEP_MUST). Mapped to Task.priority on decomposition.
export type ThoughtUrgencyLevel = "URGENT" | "SOON";

export const URGENCY_TASK_PRIORITY: Record<ThoughtUrgencyLevel, "HIGH" | "MEDIUM"> = {
  URGENT: "HIGH",
  SOON: "MEDIUM",
};

// Name shown on the board for the NOT_MINE archive column — also the status
// that's hidden by default on the Thoughts board (see ThoughtsBoardClient's
// "Show basket" toggle) since it's a soft-reject bin, not an active list.
export const TRASH_STATUS_NAME = "Кошик";

export const FILTER_OUTCOME_STATUS: Partial<
  Record<FilterOutcome, { name: string; color: string }>
> = {
  KEEP_WANT: { name: "Хочу", color: "#818cf8" },
  KEEP_MUST: { name: "Повинен", color: "#ff8c00" },
  SOMEDAY: { name: "Колись/Можливо", color: "#a78bfa" },
  DELEGATE: { name: "Делегувати", color: "#38bdf8" },
  NOT_MINE: { name: TRASH_STATUS_NAME, color: "#6b7280" },
  // DELETE has no destination status — handled as a hard delete. No longer
  // triggered by the Review wizard itself (Q1b now routes to the basket
  // instead), but still used for manual card deletion elsewhere on the board.
};
