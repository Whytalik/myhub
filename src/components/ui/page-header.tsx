import { Breadcrumb } from "./breadcrumb";
import { Heading } from "./heading";

interface PageHeaderProps {
  breadcrumb: { label: string; href?: string }[];
  title: string;
  description?: string;
}

export function PageHeader({ breadcrumb, title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col mb-8 relative">
      <div className="absolute -top-8 -left-8 w-48 h-48 bg-accent opacity-[0.025] blur-[80px] pointer-events-none rounded-full" />

      <div className="relative z-10">
        <Breadcrumb items={breadcrumb} />
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <Heading title={title} />
        {description && (
          <p className="text-subtitle text-text-secondary leading-relaxed pl-3 border-l-2 border-border-strong">
            {description}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-border-dim via-border to-transparent mt-6 mb-2 opacity-50" />
    </div>
  );
}
