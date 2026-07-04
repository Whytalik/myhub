"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SPACE_THEMES, getSpaceFromPath } from "@/lib/spaces/spaces";

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


  const getDomainFromPath = (path: string): DomainId => {
    if (path.startsWith("/operations") || path.startsWith("/planning") || path.startsWith("/life")) return "operations";
    if (path.startsWith("/health") || path.startsWith("/nutrition") || path.startsWith("/fitness")) return "health";
    if (path.startsWith("/mind") || path.startsWith("/languages") || path.startsWith("/library")) return "mind";
    if (path.startsWith("/wealth") || path.startsWith("/trading")) return "wealth";
    if (path.startsWith("/vault") || path.startsWith("/other")) return "vault";


    return "operations";
  };

  const activeDomain = getDomainFromPath(pathname);


  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", themeData.accent);
    root.style.setProperty("--color-accent-muted", themeData.accentMuted);
  }, [themeData]);


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
