export const SPACE_THEMES = {
  operations: { accent: "#fbbf24", accentMuted: "#2d2005" },
  health:     { accent: "#ff8c00", accentMuted: "#2e1c0a" },
  mind:       { accent: "#818cf8", accentMuted: "#1e1b4b" },
  wealth:     { accent: "#22c55e", accentMuted: "#052e16" },
  vault:      { accent: "#a3a3a3", accentMuted: "#262626" },
  
  // Specific spaces within domains
  planning:   { accent: "#fbbf24", accentMuted: "#2d2005" },
  food:       { accent: "#ff8c00", accentMuted: "#2e1c0a" },
  life:       { accent: "#6fbfbf", accentMuted: "#0b2222" },
  fitness:    { accent: "#e87d88", accentMuted: "#2a0d11" },
  library:    { accent: "#818cf8", accentMuted: "#1e1b4b" },
  languages:  { accent: "#c084fc", accentMuted: "#2e1a4a" },
  trading:    { accent: "#22c55e", accentMuted: "#052e16" },
  other:      { accent: "#a3a3a3", accentMuted: "#262626" },
  fishing:    { accent: "#38bdf8", accentMuted: "#0c2d4a" },
  
  default:    { accent: "#fbbf24", accentMuted: "#2d2005" },
} as const;

export type SpaceKey = keyof typeof SPACE_THEMES;

export function getSpaceFromPath(pathname: string): SpaceKey {
  // Domain Hubs
  if (pathname === "/operations") return "operations";
  if (pathname === "/health")     return "health";
  if (pathname === "/mind")       return "mind";
  if (pathname === "/wealth")     return "wealth";
  if (pathname === "/vault")      return "vault";

  // Specific Spaces
  if (pathname.startsWith("/planning"))  return "planning";
  if (pathname.startsWith("/food"))      return "food";
  if (pathname.startsWith("/life"))      return "life";
  if (pathname.startsWith("/fitness"))   return "fitness";
  if (pathname.startsWith("/library"))   return "library";
  if (pathname.startsWith("/languages")) return "languages";
  if (pathname.startsWith("/trading"))   return "trading";
  if (pathname.startsWith("/other"))     return "other";
  if (pathname.startsWith("/fishing"))   return "fishing";
  
  return "default";
}
