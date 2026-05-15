import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-8 py-8">
      <Breadcrumb items={[{ label: "life space", href: "/life" }, { label: "daily journal" }]} />

      <div className="flex-1 mt-4">
        {children}
      </div>
    </div>
  );
}
