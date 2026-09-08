"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { upsertDayScheduleAction } from "../actions/schedule-actions";
import { getDefaultBlocks } from "./context-blocks";
import type { ContextBlock, DayScheduleData } from "../types";

export interface DayScheduleState {
  trainingDayId: string | null;
  contextBlocks: ContextBlock[];
}

export function initializeDaysState(
  initialTemplates: DayScheduleData[],
): Record<number, DayScheduleState> {
  const map: Record<number, DayScheduleState> = {};
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    const template = initialTemplates.find((t) => t.dayOfWeek === dayOfWeek);
    map[dayOfWeek] = {
      trainingDayId: template?.trainingDayId ?? null,
      contextBlocks: template?.contextBlocks || getDefaultBlocks(dayOfWeek),
    };
  }
  return map;
}

export function usePersistDaySchedule(initialTemplates: DayScheduleData[]) {
  const [daysData, setDaysData] = useState(() => initializeDaysState(initialTemplates));
  const daysDataRef = useRef(daysData);
  useEffect(() => {
    daysDataRef.current = daysData;
  }, [daysData]);

  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const persistDay = useCallback(
    (dayOfWeek: number, updater: (current: DayScheduleState) => DayScheduleState) => {
      const previous = daysDataRef.current[dayOfWeek];
      const next = updater(previous);

      setPendingDay(dayOfWeek);
      setDaysData((state) => ({ ...state, [dayOfWeek]: next }));

      startTransition(async () => {
        const result = await upsertDayScheduleAction({
          dayOfWeek,
          trainingDayId: next.trainingDayId,
          contextBlocks: next.contextBlocks,
        });
        if (!result.success) {
          setDaysData((state) => ({
            ...state,
            [dayOfWeek]: previous,
          }));
        }
        setPendingDay(null);
      });
    },
    [],
  );

  return { daysData, pendingDay, persistDay };
}
