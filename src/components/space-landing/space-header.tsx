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
      <Breadcrumb items={[{ label }]} />
      <Heading title={title} />
      {description && (
        <p className="text-note text-text-secondary max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
