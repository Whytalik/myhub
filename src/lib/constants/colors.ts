export const SYSTEM_COLORS = [
  { id: "gold",    hex: "#fbbf24", label: "Amber Gold" },
  { id: "cyan",    hex: "#6fbfbf", label: "Teal" },
  { id: "orange",  hex: "#ff8c00", label: "Energy Orange" },
  { id: "rose",    hex: "#e87d88", label: "Rose" },
  { id: "purple",  hex: "#c084fc", label: "Mastery Purple" },
  { id: "indigo",  hex: "#818cf8", label: "Knowledge Indigo" },
  { id: "emerald", hex: "#22c55e", label: "Growth Green" },
  { id: "slate",   hex: "#a3a3a3", label: "Neutral Gray" },
  { id: "blue",    hex: "#3b82f6", label: "Ocean Blue" },
  { id: "red",     hex: "#ef4444", label: "Critical Red" },
] as const;

export type SystemColor = typeof SYSTEM_COLORS[number];
