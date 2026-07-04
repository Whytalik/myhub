import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/ui/display/page-header";
import { getAllEntries } from "@/features/life/services/journal-service";
import { JournalHistoryView } from "@/features/life/components/JournalHistoryView";

export const metadata: Metadata = { title: "Journal — All Entries" };

export default async function JournalHistoryPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const entries = await getAllEntries(userId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={[
          { label: "life space", href: "/life" },
          { label: "journal", href: "/life/journal" },
          { label: "history" },
        ]}
        title="History"
      />

      {entries.length === 0 ? (
        <div className="glass-card p-8 flex items-center justify-center">
          <p className="text-caption">No entries recorded yet</p>
        </div>
      ) : (
        <JournalHistoryView entries={entries} />
      )}
    </div>
  );
}
