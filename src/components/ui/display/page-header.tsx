import { Breadcrumb } from "@/components/ui/navigation/breadcrumb";
import { Heading } from "@/components/ui/display/heading";

interface PageHeaderProps {
  breadcrumb: { label: string; href?: string }[];
  title: string;
  description?: string;
}

export function PageHeader({ breadcrumb, title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-6 mb-6 border-b border-white/[0.06]">
      <Breadcrumb items={breadcrumb} />

      <div className="flex flex-col gap-1.5">
        <Heading title={title} />
        {description && <p className="text-caption max-w-2xl">{description}</p>}
      </div>
    </div>
  );
}
