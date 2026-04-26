import { SpaceHeader } from "./space-header";
import { SpaceIntelligence } from "./space-intelligence";

interface SpaceLandingProps {
  header: {
    label: string;
    title: string;
    description: string;
  };
  children: React.ReactNode;
  intelligence?: {
    title?: string;
    items: { label: string; value: string }[];
  };
  className?: string;
}

export function SpaceLanding({ header, children, intelligence, className }: SpaceLandingProps) {
  return (
    <div className={`px-6 md:px-14 py-8 md:py-10 ${className || ""}`}>
      <SpaceHeader
        label={header.label}
        title={header.title}
        description={header.description}
      />
      {children}
      {intelligence && (
        <SpaceIntelligence title={intelligence.title} items={intelligence.items} />
      )}
    </div>
  );
}
