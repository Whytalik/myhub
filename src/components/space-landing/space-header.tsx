import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

interface SpaceHeaderProps {
  label: string;
  title: string;
  description?: string;
}

export function SpaceHeader({ label, title, description }: SpaceHeaderProps) {
  return (
    <div className="flex flex-col mb-10">
      <div className="mb-4">
        <Breadcrumb items={[{ label }]} />
      </div>
      <Heading title={title} />
      <div className="h-px w-full bg-border-dim mt-4 mb-3" />
      {description && (
        <p className="text-body text-text-secondary max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
