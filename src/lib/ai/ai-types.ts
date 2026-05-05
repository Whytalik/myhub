export interface AIMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface AIActionPayload {
  domain: "operations" | "health";
  action: string;
  payload: Record<string, unknown>;
  reason: string;
}

export interface AIChatResponse {
  reply: string;
  actions: AIActionPayload[];
}

export interface AISuggestionData {
  id: string;
  userId: string;
  domain: string;
  action: string;
  payload: Record<string, unknown>;
  status: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ACTION_MAP = {
  createTask: "createTask",
  updateTask: "updateTask",
  deleteTask: "deleteTask",
  createSprint: "createSprint",
  createObjective: "createObjective",
  createKeyResult: "createKeyResult",
  createTactic: "createTactic",
  createProject: "createProject",
  createHabit: "createHabit",
  updateHabit: "updateHabit",
  deleteHabit: "deleteHabit",
  createDailyEntry: "createDailyEntry",
  updateDailyEntry: "updateDailyEntry",
  deleteDailyEntry: "deleteDailyEntry",
} as const;

export type AIActionType = (typeof ACTION_MAP)[keyof typeof ACTION_MAP];
