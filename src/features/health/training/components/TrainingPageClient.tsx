"use client";

import { Tabs } from "@/components/ui/tabs";
import { ClipboardList, Dumbbell, History as HistoryIcon } from "lucide-react";
import type {
  ExerciseData,
  TrainingPlanData,
  TrainingSessionSummaryData,
} from "../types";
import { TrainingPlansClient } from "./TrainingPlansClient";
import { TrainingExercisesClient } from "./TrainingExercisesClient";
import { TrainingHistoryClient } from "./TrainingHistoryClient";

interface TrainingPageClientProps {
  initialExercises: ExerciseData[];
  initialPlans: TrainingPlanData[];
  initialSessions: TrainingSessionSummaryData[];
}

export function TrainingPageClient({
  initialExercises,
  initialPlans,
  initialSessions,
}: TrainingPageClientProps) {
  return (
    <Tabs
      tabs={[
        {
          id: "plans",
          label: "Plans",
          icon: <ClipboardList size={16} />,
          content: (
            <TrainingPlansClient
              initialPlans={initialPlans}
              initialExercises={initialExercises}
            />
          ),
        },
        {
          id: "exercises",
          label: "Exercises",
          icon: <Dumbbell size={16} />,
          content: <TrainingExercisesClient initialExercises={initialExercises} />,
        },
        {
          id: "history",
          label: "History",
          icon: <HistoryIcon size={16} />,
          content: <TrainingHistoryClient initialSessions={initialSessions} />,
        },
      ]}
    />
  );
}
