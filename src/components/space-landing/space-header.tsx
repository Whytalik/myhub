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
      {description && (
        <p className="text-body text-text-secondary max-w-2xl leading-relaxed mt-3">
          {description}
        </p>
      )}
    </div>
  );
}
