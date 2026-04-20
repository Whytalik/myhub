"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SPACE_THEMES, getSpaceFromPath } from "@/lib/spaces";

type DomainId = "operations" | "health" | "mind" | "wealth" | "vault";

interface SpaceContextType {
  activeDomain: DomainId;
  setActiveDomain: (domain: DomainId) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = SPACE_THEMES[getSpaceFromPath(pathname)];

  // Determine domain from pathname with more precision
  const getDomainFromPath = (path: string): DomainId => {
    if (path === "/operations" || path.startsWith("/planning") || path.startsWith("/life")) return "operations";
    if (path === "/health" || path.startsWith("/food") || path.startsWith("/fitness")) return "health";
    if (path === "/mind" || path.startsWith("/languages") || path.startsWith("/library")) return "mind";
    if (path === "/wealth" || path.startsWith("/trading")) return "wealth";
    return "vault";
  };

  const [activeDomain, setActiveDomain] = useState<DomainId>(getDomainFromPath(pathname));

  // Sync domain with URL changes
  useEffect(() => {
    setActiveDomain(getDomainFromPath(pathname));
  }, [pathname]);

  return (
    <SpaceContext.Provider value={{ activeDomain, setActiveDomain }}>
      <div 
        className="flex flex-col min-h-screen"
        style={{
          "--color-accent": theme.accent,
          "--color-accent-muted": theme.accentMuted,
        } as React.CSSProperties}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            --color-accent: ${theme.accent};
            --color-accent-muted: ${theme.accentMuted};
          }
        `}} />
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
