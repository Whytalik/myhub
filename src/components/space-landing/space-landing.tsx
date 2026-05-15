import { SpaceHeader } from "./space-header";
import { SpaceIntelligence } from "./space-intelligence";

interface SpaceLandingProps {
  header: {
    label: string;
    title: string;
    description?: string;
  };
  children?: React.ReactNode;
  intelligence?: {
    title?: string;
    items: { label: string; value: string; trend?: "up" | "down" | "stable" }[];
  };
  className?: string;
}

export function SpaceLanding({ header, children, intelligence, className }: SpaceLandingProps) {
  return (
    <div className={`px-8 pt-8 pb-16 max-w-7xl mx-auto ${className || ""}`}>
      <SpaceHeader
        label={header.label}
        title={header.title}
        description={header.description}
      />
      
      <main className="space-y-12">
        {children}
      </main>

      {intelligence && (
        <SpaceIntelligence title={intelligence.title} items={intelligence.items} />
      )}
    </div>
  );
}
