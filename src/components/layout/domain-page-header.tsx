import { Breadcrumb } from "@/components/ui/navigation/breadcrumb";
import { Heading } from "@/components/ui/display/heading";

interface DomainPageHeaderProps {
  label: string;
  title: string;
  description: string;
}

export function DomainPageHeader({ label, title, description }: DomainPageHeaderProps) {
  return (
    <div >
      <Breadcrumb items={[{ label }]} />
      <Heading title={title} />
      <p >
        {description}
      </p>
    </div>
  );
}
