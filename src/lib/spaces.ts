export const SPACE_THEMES = {
  food:      { accent: "#f0a868", accentMuted: "#2e1c0a" },
  life:      { accent: "#6fbfbf", accentMuted: "#0b2222" },
  fitness:   { accent: "#e87d88", accentMuted: "#2a0d11" },
  library:   { accent: "#818cf8", accentMuted: "#1e1b4b" }, // Indigo
  languages: { accent: "#c084fc", accentMuted: "#2e1a4a" }, // Purple
  trading:   { accent: "#22c55e", accentMuted: "#052e16" }, // Green
  other:     { accent: "#a3a3a3", accentMuted: "#262626" }, // Gray
  default:   { accent: "#c084fc", accentMuted: "#2e1a4a" },
} as const;

export type SpaceKey = keyof typeof SPACE_THEMES;

export function getSpaceFromPath(pathname: string): SpaceKey {
  if (pathname.startsWith("/food"))      return "food";
  if (pathname.startsWith("/life"))      return "life";
  if (pathname.startsWith("/fitness"))   return "fitness";
  if (pathname.startsWith("/library"))   return "library";
  if (pathname.startsWith("/languages")) return "languages";
  if (pathname.startsWith("/trading"))   return "trading";
  if (pathname.startsWith("/other"))     return "other";
  return "default";
}
