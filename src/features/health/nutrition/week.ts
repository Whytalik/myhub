const UA_MONTHS_GENITIVE = [
  "січ",
  "лют",
  "бер",
  "квіт",
  "трав",
  "черв",
  "лип",
  "серп",
  "вер",
  "жовт",
  "лист",
  "груд",
];

/** Найближча неділя (локальний час), опівночі — якір поточного циклу закупівель. */
export function currentWeekStart(now: Date = new Date()): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

/**
 * YYYY-MM-DD — форма для @db.Date, ключ кешу й аргумент server actions.
 * Локальні компоненти дати, НЕ `toISOString()` — той конвертує в UTC і в
 * позитивних часових поясах здатен зсунути північ на попередній день.
 */
export function weekStartKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "6–12 лип" для рядка в списку історії. */
export function formatWeekRange(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = UA_MONTHS_GENITIVE[end.getMonth()];

  if (start.getMonth() === end.getMonth()) {
    return `${startDay}–${endDay} ${month}`;
  }
  const startMonth = UA_MONTHS_GENITIVE[start.getMonth()];
  return `${startDay} ${startMonth} – ${endDay} ${month}`;
}

import { DayPlan, Weekday } from "./types";
import { SET_PLAN } from "./data";

const WEEKDAY_OFFSET_FROM_SUNDAY: Record<Weekday, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/** `weekStartSunday` (з `currentWeekStart()`) + якого дня тижня чіп → конкретна дата. */
export function dateForWeekdayInWeek(weekStartSunday: Date, day: Weekday): Date {
  const result = new Date(weekStartSunday);
  result.setDate(result.getDate() + WEEKDAY_OFFSET_FROM_SUNDAY[day]);
  return result;
}

import { getCurrentSeason, transformPlanForSeason, type Season } from "./seasonal-substitutions";

/**
 * Повертає активний набір із 7 сетів з урахуванням сезонних заміни продуктів
 * (наприклад, сливи/персики влітку → запечені яблука/груші восени під той самий макропрофіль).
 */
export function getActiveSetPlan(
  weekStart?: string | Date,
  seasonOverride?: string,
): DayPlan[] {
  const date = weekStart
    ? typeof weekStart === "string"
      ? new Date(weekStart)
      : weekStart
    : new Date();

  const activeSeason: Season =
    seasonOverride && ["summer", "autumn", "winter", "spring"].includes(seasonOverride)
      ? (seasonOverride as Season)
      : getCurrentSeason(date);

  return transformPlanForSeason(SET_PLAN, activeSeason, date.getMonth());
}
