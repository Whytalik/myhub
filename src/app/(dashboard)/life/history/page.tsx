import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { getAllEntries } from "@/features/life/services/journal-service";
import { JournalHistoryView } from "@/features/life/components/JournalHistoryView";

export const metadata: Metadata = { title: "Journal — All Entries" };

export default async function JournalHistoryPage() {
  const session = await auth();
  const personId = (session?.user as any)?.personId;

  if (!session || !personId) {
    redirect("/login");
  }

  const entries = await getAllEntries(personId);

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <Breadcrumb
        items={[
          { label: "life space", href: "/life" },
          { label: "daily journal", href: "/life/journal" },
          { label: "history" },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <Heading title="History" />
        <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
          {entries.length} entries
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-20 text-center text-muted text-sm italic">
          No entries recorded yet
        </div>
      ) : (
        <JournalHistoryView entries={entries} />
      )}
    </div>
  );
}
