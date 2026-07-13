export type ThoughtType = "WORRY_PROBLEM" | "IDEA_DREAM" | "TASK_DEADLINE";

export interface ThoughtTemplateField {
  key: string;
  label: string;
  placeholder: string;
}

export interface ThoughtTypeConfig {
  id: ThoughtType;
  label: string;
  icon: string;
  fields: ThoughtTemplateField[];
}

// Grounded in research: Worry Tree (Butler & Hope) treats worry/problem as
// one instrument with one branch; GTD treats task/deadline as one object
// with an optional date field — hence 3 types, not the original 6.
export const THOUGHT_TYPE_CONFIGS: ThoughtTypeConfig[] = [
  {
    id: "WORRY_PROBLEM",
    label: "Worry / Problem",
    icon: "AlertTriangle",
    fields: [
      { key: "worry", label: "What worries me", placeholder: "..." },
      { key: "worstCase", label: "Worst-case scenario", placeholder: "..." },
      { key: "firstAction", label: "First action to minimize it", placeholder: "..." },
    ],
  },
  {
    id: "IDEA_DREAM",
    label: "Idea / Dream",
    icon: "Sparkles",
    fields: [
      { key: "want", label: "What I want", placeholder: "..." },
      { key: "why", label: "Why it matters to me", placeholder: "..." },
    ],
  },
  {
    id: "TASK_DEADLINE",
    label: "Task / Deadline",
    icon: "CheckCircle2",
    fields: [
      { key: "verb", label: "Verb + what to do", placeholder: "e.g. Enroll in an English course" },
      {
        key: "criterion",
        label: "Completion criterion / deadline",
        placeholder: "e.g. by 15.09, level B2",
      },
    ],
  },
];

export function getThoughtTypeConfig(
  type: ThoughtType | null | undefined,
): ThoughtTypeConfig | null {
  if (!type) return null;
  return THOUGHT_TYPE_CONFIGS.find((config) => config.id === type) ?? null;
}
