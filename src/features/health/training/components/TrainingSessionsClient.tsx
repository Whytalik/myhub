"use client";

import { useRouter } from "next/navigation";
import { History as HistoryIcon } from "lucide-react";
import type { TrainingSessionSummaryData } from "../types";

interface TrainingHistoryClientProps {
  initialSessions: TrainingSessionSummaryData[];
}

export function TrainingHistoryClient({
  initialSessions,
}: TrainingHistoryClientProps) {
  const router = useRouter();

  if (initialSessions.length === 0) {
    return (
      <div >
        <div >
          <HistoryIcon size={32} />
        </div>
        <p >No sessions logged yet</p>
        <p >
          Start a session from the Plans tab to begin logging your workouts.
        </p>
      </div>
    );
  }

  return (
    <div >
      {initialSessions.map((s) => (
        <button
          key={s.id}
          onClick={() => router.push(`/health/training/session/${s.id}`)}

        >
          <div >
            <span >{s.dayName}</span>
            <span >
              {new Date(s.date).toLocaleDateString()} · {s._count.setLogs} sets
            </span>
          </div>
          <span

          >
            {s.status === "completed" ? "Completed" : "In progress"}
          </span>
        </button>
      ))}
    </div>
  );
}
