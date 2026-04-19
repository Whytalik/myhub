"use client";

import { usePathname } from "next/navigation";
import { SYSTEM_THEMES, getSystemFromPath } from "@/lib/spaces";

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = SYSTEM_THEMES[getSystemFromPath(pathname)];

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
