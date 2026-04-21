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
  // New vibrant colors
  { id: "lime",    hex: "#a3e635", label: "Electric Lime" },
  { id: "sky",     hex: "#0ea5e9", label: "Sky Blue" },
  { id: "fuchsia", hex: "#d946ef", label: "Fuchsia Pink" },
  { id: "pink",    hex: "#f472b6", label: "Soft Pink" },
  { id: "violet",  hex: "#8b5cf6", label: "Deep Violet" },
  { id: "mint",    hex: "#4ade80", label: "Fresh Mint" },
  { id: "yellow",  hex: "#facc15", label: "Bright Yellow" },
  { id: "silver",  hex: "#e2e8f0", label: "Pure Silver" },
  { id: "crimson", hex: "#be123c", label: "Deep Crimson" },
  { id: "coffee",  hex: "#92400e", label: "Warm Coffee" },
] as const;

export type SystemColor = typeof SYSTEM_COLORS[number];

export const DEFAULT_SPACE_COLORS: Record<string, { text: string; bgActive: string; bgInactive: string; borderActive: string; borderInactive: string }> = {
  "Life Space":     { text: "#6fbfbf", bgActive: "var(--color-life-muted)", bgInactive: "transparent", borderActive: "rgba(111,191,191,0.2)", borderInactive: "var(--color-border)" },
  "Planning Space": { text: "#fbbf24", bgActive: "rgba(251,191,36,0.1)",  bgInactive: "transparent",  borderActive: "rgba(251,191,36,0.2)",  borderInactive: "var(--color-border)" },
  "Food Space":     { text: "#ff8c00", bgActive: "rgba(255,140,0,0.1)",   bgInactive: "transparent",   borderActive: "rgba(255,140,0,0.2)",   borderInactive: "var(--color-border)" },
  "Fitness Space":  { text: "#e87d88", bgActive: "rgba(232,125,136,0.1)", bgInactive: "transparent", borderActive: "rgba(232,125,136,0.2)", borderInactive: "var(--color-border)" },
  "Language Space": { text: "#c084fc", bgActive: "rgba(192,132,252,0.1)", bgInactive: "transparent", borderActive: "rgba(192,132,252,0.2)", borderInactive: "var(--color-border)" },
  "Library Space":  { text: "#818cf8", bgActive: "rgba(129,140,248,0.1)", bgInactive: "transparent", borderActive: "rgba(129,140,248,0.2)", borderInactive: "var(--color-border)" },
  "Trading Space":  { text: "#22c55e", bgActive: "rgba(34,197,94,0.1)",  bgInactive: "transparent",  borderActive: "rgba(34,197,94,0.2)",  borderInactive: "var(--color-border)" },
  "Misc / Other":   { text: "#a3a3a3", bgActive: "rgba(163,163,163,0.1)", bgInactive: "transparent", borderActive: "rgba(163,163,163,0.2)", borderInactive: "var(--color-border)" },
};
