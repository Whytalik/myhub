import type { ContextBlock } from "../types";

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface StandardBlockTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  bufferMinutes: number;
  sphereNames: string[];
}

export const STANDARD_BLOCK_TEMPLATES: StandardBlockTemplate[] = [
  {
    id: "health",
    name: "Health / Body",
    startTime: "07:00",
    endTime: "09:15",
    bufferMinutes: 15,
    sphereNames: ["Health", "Sport"],
  },
  {
    id: "work",
    name: "Business / Work",
    startTime: "09:30",
    endTime: "17:30",
    bufferMinutes: 30,
    sphereNames: ["Work", "Trading", "Finance"],
  },
  {
    id: "family",
    name: "Family / Romance",
    startTime: "18:00",
    endTime: "19:45",
    bufferMinutes: 15,
    sphereNames: ["Family & Friends", "Romance"],
  },
  {
    id: "growth",
    name: "Personal Growth",
    startTime: "18:00",
    endTime: "18:45",
    bufferMinutes: 15,
    sphereNames: ["Personal Growth"],
  },
  {
    id: "hobby",
    name: "Hobby",
    startTime: "19:00",
    endTime: "19:45",
    bufferMinutes: 15,
    sphereNames: ["Fun & Recreation", "Environment / Space"],
  },
  {
    id: "kaizen",
    name: "Kaizen (System)",
    startTime: "20:00",
    endTime: "20:45",
    bufferMinutes: 15,
    sphereNames: [],
  },
  {
    id: "recovery",
    name: "Recovery",
    startTime: "21:00",
    endTime: "22:45",
    bufferMinutes: 15,
    sphereNames: ["Health"],
  },
];

export const getBlockBorderClass = (blockId: string): string => {
  const id = blockId.toLowerCase();
  if (id.startsWith("health") || id.startsWith("recovery")) {
    return "border-l-emerald-500/60";
  }
  if (id.startsWith("work")) {
    return "border-l-blue-500/60";
  }
  if (id.startsWith("family") || id.startsWith("romance")) {
    return "border-l-rose-500/60";
  }
  if (id.startsWith("growth") || id.startsWith("hobby")) {
    return "border-l-purple-500/60";
  }
  if (id.startsWith("kaizen")) {
    return "border-l-amber-500/60";
  }
  return "border-l-zinc-500/60";
};

export const getBlockDotClass = (blockId: string): string => {
  const id = blockId.toLowerCase();
  if (id.startsWith("health") || id.startsWith("recovery")) {
    return "bg-emerald-500/70";
  }
  if (id.startsWith("work")) {
    return "bg-blue-500/70";
  }
  if (id.startsWith("family") || id.startsWith("romance")) {
    return "bg-rose-500/70";
  }
  if (id.startsWith("growth") || id.startsWith("hobby")) {
    return "bg-purple-500/70";
  }
  if (id.startsWith("kaizen")) {
    return "bg-amber-500/70";
  }
  return "bg-zinc-500/70";
};

export const getBlockDisplayName = (blockId: string, originalName: string): string => {
  const id = blockId.toLowerCase();
  if (id.startsWith("health")) {
    return "Health / Body";
  }
  if (id.startsWith("work")) {
    return "Business / Work";
  }
  if (id.startsWith("family")) {
    return "Family / Romance";
  }
  if (id.startsWith("hobby")) {
    return "Hobby";
  }
  if (id.startsWith("growth")) {
    return "Personal Growth";
  }
  if (id.startsWith("kaizen")) {
    return "Kaizen (System)";
  }
  if (id.startsWith("recovery")) {
    return "Recovery";
  }
  return originalName;
};

export const toContextBlock = (template: StandardBlockTemplate): ContextBlock => ({
  ...template,
  id: `${template.id}-${Date.now()}`,
});