import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

interface SpaceHeaderProps {
  label: string;
  title: string;
  description?: string;
}

export function SpaceHeader({ label, title, description }: SpaceHeaderProps) {
  // Map label to domain color for the accent glow
  const getDomainColor = (l: string) => {
    const map: Record<string, string> = {
      operations: "bg-domain-ops",
      health: "bg-domain-health",
      mind: "bg-domain-mind",
      wealth: "bg-domain-wealth",
      vault: "bg-domain-vault",
    };
    return map[l.toLowerCase()] || "bg-accent";
  };

  const domainColor = getDomainColor(label);

  return (
    <div className="flex flex-col mb-10 relative">
      {/* Decorative accent glow */}
      <div className={`absolute -top-20 -left-20 w-64 h-64 ${domainColor} opacity-[0.03] blur-[100px] pointer-events-none rounded-full`} />

      <div className="relative z-10">
        <Breadcrumb items={[{ label }]} />
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <Heading title={title} className="text-hero tracking-tight" />
        {description && (
          <p className="text-body text-text-secondary leading-relaxed pl-3 border-l-2 border-border-strong">
            {description}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
    </div>
  );
}
