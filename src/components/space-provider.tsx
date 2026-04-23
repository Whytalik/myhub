"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SPACE_THEMES, getSpaceFromPath } from "@/lib/spaces";

type DomainId = "operations" | "health" | "mind" | "wealth" | "vault";
type Theme = "dark" | "light";

interface SpaceContextType {
  activeDomain: DomainId;
  setActiveDomain: (domain: DomainId) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const themeData = SPACE_THEMES[getSpaceFromPath(pathname)];

  // Domain Logic - Derived directly from pathname to prevent sync lag
  const getDomainFromPath = (path: string): DomainId => {
    if (path === "/operations" || path.startsWith("/planning") || path.startsWith("/life")) return "operations";
    if (path === "/health" || path.startsWith("/food") || path.startsWith("/fitness")) return "health";
    if (path === "/mind" || path.startsWith("/languages") || path.startsWith("/library")) return "mind";
    if (path === "/wealth" || path.startsWith("/trading")) return "wealth";
    return "vault";
  };

  const activeDomain = getDomainFromPath(pathname);

  // Sync CSS variables for accent colors
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", themeData.accent);
    root.style.setProperty("--color-accent-muted", themeData.accentMuted);
  }, [themeData]);

  // Theme Logic
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("system-theme") as Theme;
      if (savedTheme) {
        document.documentElement.classList.toggle("light", savedTheme === "light");
        return savedTheme;
      }
    }
    return "dark";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("system-theme", newTheme);
    document.documentElement.classList.toggle("light", newTheme === "light");
  };

  return (
    <SpaceContext.Provider value={{ activeDomain, setActiveDomain: () => {}, theme, setTheme }}>
      <div 
        className="flex flex-col min-h-screen transition-colors duration-300"
        style={{
          "--color-accent": themeData.accent,
          "--color-accent-muted": themeData.accentMuted,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error("useSpace must be used within a SpaceProvider");
  }
  return context;
}
