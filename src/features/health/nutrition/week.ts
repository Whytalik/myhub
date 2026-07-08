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
export function weekStartKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
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

import { DayPlan } from "./types";
import { DEFAULT_WEEK_PLAN, SUMMER_WEEK_PLAN } from "./data";

/**
 * Повертає активний план на тиждень залежно від дати чи weekStart.
 * Літні місяці (червень, липень, серпень) використовують літній план, решта — зимовий/дефолтний.
 */
export function getActiveWeekPlan(weekStart?: string | Date): DayPlan[] {
  let date: Date;
  if (!weekStart) {
    date = new Date();
  } else if (typeof weekStart === "string") {
    date = new Date(`${weekStart}T00:00:00`);
    if (isNaN(date.getTime())) date = new Date();
  } else {
    date = weekStart;
  }

  const month = date.getMonth();
  // 5 = Червень, 6 = Липень, 7 = Серпень
  if (month >= 5 && month <= 7) {
    return SUMMER_WEEK_PLAN;
  }
  return DEFAULT_WEEK_PLAN;
}

