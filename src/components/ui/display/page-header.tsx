import { Breadcrumb } from "@/components/ui/navigation/breadcrumb";
import { Heading } from "@/components/ui/display/heading";

interface PageHeaderProps {
  breadcrumb: { label: string; href?: string }[];
  title: string;
  description?: string;
}

export function PageHeader({ breadcrumb, title, description }: PageHeaderProps) {
  return (
    <div >
      <div />

      <div >
        <Breadcrumb items={breadcrumb} />
      </div>

      <div >
        <Heading title={title} />
        {description && (
          <p >
            {description}
          </p>
        )}
      </div>

      <div />
    </div>
  );
}
