import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb items={[{ label: "life space", href: "/life" }, { label: "daily journal" }]} />

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
