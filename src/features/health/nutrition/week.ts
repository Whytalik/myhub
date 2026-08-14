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
import { SUMMER_SET_PLAN, WINTER_SET_PLAN, AUTUMN_SET_PLAN, SPRING_SET_PLAN } from "./data";

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

/**
 * Повертає активний набір із 7 сетів залежно від дати чи weekStart та обраного сезону в налаштуваннях.
 * Якщо сезон задано явно (у cookies/параметрах), повертає відповідний план.
 * Якщо сезон "auto" або не задано, перемикає за місяцями в Україні.
 */
export function getActiveSetPlan(weekStart?: string | Date, seasonOverride?: string): DayPlan[] {
  let season = seasonOverride;
  if (!season && typeof window !== "undefined") {
    const match = document.cookie.match(/(^| )nutrition-menu-season=([^;]+)/);
    season = match ? decodeURIComponent(match[2]) : undefined;
  }

  if (season === "summer") return SUMMER_SET_PLAN;
  if (season === "autumn") return AUTUMN_SET_PLAN;
  if (season === "winter") return WINTER_SET_PLAN;
  if (season === "spring") return SPRING_SET_PLAN;

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
  // 5 = Червень, 6 = Липень, 7 = Серпень (Літо)
  if (month >= 5 && month <= 7) {
    return SUMMER_SET_PLAN;
  }
  // 8 = Вересень, 9 = Жовтень, 10 = Листопад (Осінь)
  if (month >= 8 && month <= 10) {
    return AUTUMN_SET_PLAN;
  }
  // 2 = Березень, 3 = Квітень, 4 = Травень (Весна)
  if (month >= 2 && month <= 4) {
    return SPRING_SET_PLAN;
  }
  // 11 = Грудень, 0 = Січень, 1 = Лютий (Зима)
  return WINTER_SET_PLAN;
}
