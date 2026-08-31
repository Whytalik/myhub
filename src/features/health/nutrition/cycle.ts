import { DayPlan, SetId } from "./types";

export const SET_IDS: readonly SetId[] = ["set1", "set2", "set3", "set4", "set5", "set6", "set7"];

/**
 * Довільна, але НАЗАВЖДИ фіксована точка відліку — 31 груд 2023 (неділя). Оскільки
 * `14 % 7 === 0`, мапінг сет↔пара-реальних-днів-тижня не залежить від того, яку саме
 * дату обрати як епоху (просто зсуває фазу) — цю зафіксовано так, щоб set1 стартував
 * із неділі (день великої закупівлі), узгоджено з історичним порядком `monday..sunday`:
 *
 *   set1 (був monday.ts)    — Нд + Пн
 *   set2 (був tuesday.ts)   — Вт + Ср
 *   set3 (був wednesday.ts, виняток — 2 різні страви) — Чт + Пт
 *   set4 (був thursday.ts)  — Сб + Нд
 *   set5 (був friday.ts)    — Пн + Вт
 *   set6 (був saturday.ts)  — Ср + Чт
 *   set7 (був sunday.ts)    — Пт + Сб
 *
 * set4 і set6 — єдині два сети, чия пара днів перетинає межу тижневих закупівель
 * (Нд-трип охоплює Нд–Ср, Ср-трип охоплює Чт–Сб) — неминуче для будь-якої епохи
 * (7 зсувів, 2 фіксовані межі на тиждень). SHOPPING_LIST наразі НЕ розбиває позиції
 * по day1/day2 (buyDay-групування лишили таким, яким воно було до переходу на сети —
 * `sumMacroGramsForSets` рахує правильну загальну кількість незалежно від того, на
 * який трип потрапив запис), тому цей straddle не вимагає негайних правок там.
 */
export const SET_CYCLE_EPOCH = new Date(2024, 0, 7);

function daysBetween(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86400000);
}

/** Позиція 0-13 у фіксованій 14-денній ротації — детермінована, нічого не зберігається. */
export function cycleDayOf(date: Date, epoch: Date = SET_CYCLE_EPOCH): number {
  const diff = daysBetween(epoch, date);
  return ((diff % 14) + 14) % 14;
}

export interface CyclePosition {
  /** 0-6 — індекс у 7-елементному DayPlan[]. */
  setIndex: number;
  setId: SetId;
  /** Який день сета сьогодні — 1 або 2. */
  subDay: 1 | 2;
}

export function cyclePositionOf(date: Date, epoch: Date = SET_CYCLE_EPOCH): CyclePosition {
  const cycleDay = cycleDayOf(date, epoch);
  const setIndex = Math.floor(cycleDay / 2);
  const subDay = ((cycleDay % 2) + 1) as 1 | 2;
  return { setIndex, setId: SET_IDS[setIndex], subDay };
}

/**
 * Реальні "трипи" закупівлі всередині 14-денного циклу. Нд-трип і Ср-трип із
 * коментаря вище повторюються двічі (тиждень 1, тиждень 2) — тож повний цикл = 4
 * трипи, межі яких прив'язані до `cycleDay`: 0-3 (Нд-Ср тижня 1), 4-6 (Чт-Сб
 * тижня 1), 7-10 (Нд-Ср тижня 2), 11-13 (Чт-Сб тижня 2).
 */
export function tripIndexOfCycleDay(cycleDay: number): number {
  if (cycleDay < 4) return 0;
  if (cycleDay < 7) return 1;
  if (cycleDay < 11) return 2;
  return 3;
}

/** Який трип відповідає конкретному (сет, день) — set4 і set6 єдині сети, чиї
 *  day1/day2 потрапляють у РІЗНІ трипи (той самий straddle, що описаний вище). */
export function tripIndexOfSetDay(setId: SetId, day: 1 | 2): number {
  const setIndex = SET_IDS.indexOf(setId);
  return tripIndexOfCycleDay(setIndex * 2 + (day - 1));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Дата в тому самому 14-денному вікні, що й `referenceDate`, яка відповідає заданим
 * `setIndex`/`subDay` — для прев'ю не-сьогоднішнього сета (таб-стрічка) все одно
 * потрібна конкретна реальна дата (дедуп-ключ FatSecret-пуша, "завтра" для
 * розморозки), а не просто абстрактна позиція.
 */
export function dateForCyclePosition(
  referenceDate: Date,
  setIndex: number,
  subDay: 1 | 2,
  epoch: Date = SET_CYCLE_EPOCH,
): Date {
  const targetCycleDay = setIndex * 2 + (subDay - 1);
  const referenceCycleDay = cycleDayOf(referenceDate, epoch);
  return addDays(referenceDate, targetCycleDay - referenceCycleDay);
}

/** `DayPlan` мінус day2-поля, плюс конкретна дата й день сета — те, що фактично рендериться. */
export type ResolvedDayView = Omit<
  DayPlan,
  "day2Meals" | "day2PrepSteps" | "day2Note" | "day2LabelUk" | "day2ThawInstructions"
> & {
  date: Date;
  subDay: 1 | 2;
};

/** День 2 = `day2Meals` якщо є (сет-виняток), інакше ідентичний дню 1 (дефолт для 6 із 7 сетів). */
export function resolveDayView(entry: DayPlan, subDay: 1 | 2, date: Date): ResolvedDayView {
  const useDay2 = subDay === 2 && entry.day2Meals !== undefined;
  return {
    ...entry,
    date,
    subDay,
    meals: useDay2 ? entry.day2Meals! : entry.meals,
    prepSteps: useDay2 ? (entry.day2PrepSteps ?? entry.prepSteps) : entry.prepSteps,
    note: useDay2 ? (entry.day2Note ?? entry.note) : entry.note,
    labelUk: useDay2 ? (entry.day2LabelUk ?? entry.labelUk) : entry.labelUk,
    thawInstructions: useDay2
      ? (entry.day2ThawInstructions ?? entry.thawInstructions)
      : entry.thawInstructions,
  };
}
