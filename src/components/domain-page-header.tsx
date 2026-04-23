import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";

interface DomainPageHeaderProps {
  label: string;
  title: string;
  description: string;
}

export function DomainPageHeader({ label, title, description }: DomainPageHeaderProps) {
  return (
    <div className="flex flex-col mb-16">
      <Breadcrumb items={[{ label }]} className="mb-6" />
      <Heading title={title} />
      <p className="text-secondary max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}
