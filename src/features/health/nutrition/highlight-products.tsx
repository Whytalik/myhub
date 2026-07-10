import type { ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";

// Найпоширеніші українські відмінкові закінчення іменників, від найдовших
// до найкоротших — щоб коректно відкидати саме закінчення, а не корінь.
const ENDINGS = [
  "ями",
  "ами",
  "ів",
  "ям",
  "ам",
  "ах",
  "ях",
  "ею",
  "ою",
  "ем",
  "єм",
  "им",
  "ім",
  "их",
  "ий",
  "ій",
  "а",
  "я",
  "у",
  "ю",
  "о",
  "е",
  "є",
  "и",
  "і",
  "й",
];

function stripEnding(word: string): string {
  for (const ending of ENDINGS) {
    if (word.endsWith(ending) && word.length - ending.length >= 3) {
      return word.slice(0, word.length - ending.length);
    }
  }
  return word;
}

/** Останнє слово назви продукту (без дужок) — зазвичай іменник в укр. порядку "прикметник іменник". */
function lastWord(nameUk: string): string {
  const clean = nameUk.replace(/\(.*?\)/g, "");
  const words = clean.toLowerCase().match(/[а-яіїєґ'’]+/g);
  return words ? words[words.length - 1] : clean.toLowerCase();
}

interface StemEntry {
  stem: string;
  excludeAfter?: string[];
  productKey: string;
}

function buildStems(): StemEntry[] {
  const byStem = new Map<string, StemEntry>();
  for (const product of Object.values(PRODUCTS) as Product[]) {
    const source = product.searchTerm ?? lastWord(product.nameUk);
    // searchTerm може містити кілька коренів через пробіл — потрібно для
    // прикметникових форм з чергуванням приголосних (гірчиця → гірчичний),
    // які звичайне відкидання закінчень не вловлює.
    for (const word of source.split(/\s+/)) {
      const stem = stripEnding(word.toLowerCase());
      if (stem.length < 3) continue;
      const existing = byStem.get(stem);
      if (existing?.excludeAfter && !product.excludeAfter) continue;
      byStem.set(stem, { stem, excludeAfter: product.excludeAfter, productKey: product.key });
    }
  }
  // Найдовші корені першими, щоб довший специфічний збіг вигравав у regex-альтернації.
  return [...byStem.values()].sort((a, b) => b.stem.length - a.stem.length);
}

const STEMS = buildStems();

// \w у JS-регексах не охоплює кирилицю — продовження слова описуємо явним класом символів.
const WORD_CHAR = "а-яіїєґА-ЯІЇЄҐ'’";

const HIGHLIGHT_REGEX = new RegExp(
  `(?<![${WORD_CHAR}])(${STEMS.map((s) => {
    const exclusion = s.excludeAfter?.length ? `(?!${s.excludeAfter.join("|")})` : "";
    return `${s.stem}${exclusion}[${WORD_CHAR}]*`;
  }).join("|")})(?![${WORD_CHAR}])`,
  "giu",
);

/**
 * Огортає будь-яке входження назви продукту (чи його відмінкової варіації) у
 * тексті в `<mark>`, щоб воно візуально виділялося. Пошук — за коренем слова
 * (без урахування чергувань голосних на кшталт огірок/огірка) — це проста
 * евристика, а не повний словник словоформ.
 */
export function highlightProductMentions(text: string): ReactNode {
  const parts = text.split(HIGHLIGHT_REGEX);
  if (parts.length === 1) return text;

  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <mark
        key={idx}
        className="bg-accent-nutrition/15 text-accent-nutrition rounded px-0.5 font-medium"
      >
        {part}
      </mark>
    ) : (
      <span key={idx}>{part}</span>
    ),
  );
}

const PANTRY_STEMS = STEMS.filter((s) => PRODUCTS[s.productKey]?.kind === "pantry");

/**
 * Pantry products (спеції/приправи) never get a `macroItems` entry — they carry
 * no macros — so anything that reads only `macroItems` (like DayPlan.tsx's
 * "Продукти на день" totals) silently drops them. This scans free-text mentions
 * (ingredients/prep steps) to recover which pantry products a day actually needs.
 */
export function findMentionedPantryProductKeys(texts: string[]): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    for (const entry of PANTRY_STEMS) {
      if (found.has(entry.productKey)) continue;
      const exclusion = entry.excludeAfter?.length ? `(?!${entry.excludeAfter.join("|")})` : "";
      const re = new RegExp(
        `(?<![${WORD_CHAR}])(${entry.stem}${exclusion}[${WORD_CHAR}]*)(?![${WORD_CHAR}])`,
        "iu",
      );
      if (re.test(text)) found.add(entry.productKey);
    }
  }
  return [...found];
}
