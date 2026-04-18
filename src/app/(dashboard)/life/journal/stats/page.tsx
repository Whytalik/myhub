import { getAllEntries, getDailyStats } from "@/features/life/services/journal-service";
import { getTaskStats } from "@/features/life/services/task-service";
import { JournalStatsView } from "@/features/life/components/JournalStatsView";

export const metadata = {
  title: "Stats",
};

export const dynamic = "force-dynamic";

export default async function JournalStatsPage() {
  const [entries, journalStats, taskStats] = await Promise.all([
    getAllEntries(),
    getDailyStats(),
    getTaskStats()
  ]);

  return <JournalStatsView entries={entries} stats={journalStats} taskStats={taskStats} />;
}
