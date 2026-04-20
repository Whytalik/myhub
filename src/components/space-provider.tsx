"use client";

import { usePathname } from "next/navigation";
import { SPACE_THEMES, getSpaceFromPath } from "@/lib/spaces";

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = SPACE_THEMES[getSpaceFromPath(pathname)];

  return (
    <div 
      className="flex flex-col md:flex-row min-h-screen"
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
  );
}
