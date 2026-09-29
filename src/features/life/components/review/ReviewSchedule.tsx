"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { saveWeeklyReviewSettingsAction } from "@/features/life/actions/weekly-review-actions";
import type { WeeklyReviewSettings } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ICS_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const REVIEW_DURATION_MINUTES = 40;

// A recurring calendar event: the review only happens if it has a fixed slot.
function downloadCalendarEvent(settings: WeeklyReviewSettings) {
  const [hours, minutes] = settings.time.split(":").map(Number);
  const first = new Date();
  first.setHours(hours, minutes, 0, 0);
  first.setDate(first.getDate() + ((settings.day - first.getDay() + 7) % 7));
  if (first < new Date()) first.setDate(first.getDate() + 7);
  const end = new Date(first.getTime() + REVIEW_DURATION_MINUTES * 60_000);
  const stamp = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//myhub//weekly-review//EN",
    "BEGIN:VEVENT",
    `UID:weekly-review-${settings.day}-${settings.time}@myhub`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(first)}`,
    `DTEND:${stamp(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${ICS_DAYS[settings.day]}`,
    "SUMMARY:Weekly Review",
    `DESCRIPTION:${window.location.origin}/life/planning/review`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "weekly-review.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}

export function ReviewSchedule({ settings }: { settings: WeeklyReviewSettings }) {
  const { run, isPending } = useServerAction();
  const [day, setDay] = useState(settings.day);
  const [time, setTime] = useState(settings.time);
  const isChanged = day !== settings.day || time !== settings.time;
  // Preview of the next slot, so the commitment feels concrete.
  const label = `${DAY_LABELS[day]} at ${time}`;

  return (
    <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="flex flex-col">
        <span className="text-label">Review slot</span>
        <span className="text-sm text-zinc-200">Every {label}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-36">
          <Select value={String(day)} onChange={(e) => setDay(Number(e.target.value))}>
            {DAY_LABELS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-28"
        />
        {isChanged && (
          <Button
            variant="primary"
            size="sm"
            disabled={isPending || !time}
            onClick={() =>
              run(saveWeeklyReviewSettingsAction({ day, time }), {
                successMessage: "Review slot saved",
                errorMessage: "Failed to save",
              })
            }
          >
            Save
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => downloadCalendarEvent({ day, time })}>
          <CalendarPlus size={14} /> Add to calendar
        </Button>
      </div>
    </div>
  );
}
