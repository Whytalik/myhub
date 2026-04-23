import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllEntries, getDailyStats } from "@/features/life/services/journal-service";
import { getTaskStats } from "@/features/life/services/task-service";
import { JournalStatsView } from "@/features/life/components/JournalStatsView";

export const metadata = {
  title: "Stats",
};

export const dynamic = "force-dynamic";

export default async function JournalStatsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [entries, journalStats, taskStats] = await Promise.all([
    getAllEntries(userId),
    getDailyStats(userId),
    getTaskStats(userId)
  ]);

  return <JournalStatsView entries={entries} stats={journalStats} taskStats={taskStats} />;
}
