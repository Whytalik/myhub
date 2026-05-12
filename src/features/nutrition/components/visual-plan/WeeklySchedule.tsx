"use client";

import { useState, useEffect } from "react";
import { CollapsibleSection } from "./CollapsibleSection";
import { FAST_FOOD_PICKS, FF_STORAGE_KEY, FF_EVENT } from "../../constants/fast-food-picks";
import { MEAL_VARIANTS, MEAL_TYPE_STYLE, CHOICES_STORAGE_KEY, CHOICES_EVENT, WEEKLY_SCHEDULE } from "../../constants/meal-variants";
import { PRODUCT_INFO } from "../../constants/product-info";
import { SAUCES } from "../../constants/sauces";

const YOU_KCAL_TARGET = 1700;
const HER_KCAL_TARGET = 2300;

function isSauceOrSpice(product: string): boolean {
  // Тільки ті, що є у списку готових соусів/маринадів
  return !!SAUCES[product];
}

function spiceIcon(product: string): string | null {
  if (SAUCES[product]) return SAUCES[product].type === "marinade" ? "🧂" : "🥣";
  const info = PRODUCT_INFO[product];
  if (info?.category === "drinks") return "☕";
  return null;
}

const MEAL_ORDER = ["Передтрен", "Сніданок", "Обід", "Вечеря"];

function calcMealKcal(
  variant: (typeof MEAL_VARIANTS)[string][number],
  who: "you" | "her",
  day: string,
  mealType: string,
  productChoices: Record<string, string>
): number {
  let total = 0;
  variant.products.forEach((p, pIdx) => {
    const grams = who === "you" ? p.youGrams : p.herGrams;
    if (grams <= 0) return;
    const resolvedName = productChoices[`${day}-${mealType}-${pIdx}`] ?? p.name;
    const info = PRODUCT_INFO[resolvedName];
    if (info) total += (info.kcal * grams) / 100;
  });
  return Math.round(total);
}

function calcFfKcal(ff: (typeof FAST_FOOD_PICKS)[number], who: "you" | "her"): number {
  let total = 0;
  ff.items.forEach((p) => {
    const grams = who === "you" ? p.youGrams : p.herGrams;
    if (grams <= 0) return;
    const info = PRODUCT_INFO[p.name];
    if (info) total += (info.kcal * grams) / 100;
  });
  return Math.round(total);
}

export const WeeklySchedule = () => {
  const [selectedFfId, setSelectedFfId] = useState<string | null>(null);
  const [productChoices, setProductChoices] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedFf = localStorage.getItem(FF_STORAGE_KEY);
    const savedChoices = localStorage.getItem(CHOICES_STORAGE_KEY);

    Promise.resolve().then(() => {
      if (savedFf) setSelectedFfId(savedFf);
      if (savedChoices) {
        try { setProductChoices(JSON.parse(savedChoices)); } catch {}
      }
    });

    const ffHandler = (e: Event) => setSelectedFfId((e as CustomEvent<string | null>).detail);
    const choicesHandler = (e: Event) => setProductChoices((e as CustomEvent<Record<string, string>>).detail);

    window.addEventListener(FF_EVENT, ffHandler);
    window.addEventListener(CHOICES_EVENT, choicesHandler);
    return () => {
      window.removeEventListener(FF_EVENT, ffHandler);
      window.removeEventListener(CHOICES_EVENT, choicesHandler);
    };
  }, []);

  const selectFf = (id: string) => {
    const next = selectedFfId === id ? null : id;
    setSelectedFfId(next);
    if (next) localStorage.setItem(FF_STORAGE_KEY, next);
    else localStorage.removeItem(FF_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(FF_EVENT, { detail: next }));
  };

  const selectProductAlt = (day: string, mealType: string, pIdx: number, altName: string) => {
    const key = `${day}-${mealType}-${pIdx}`;
    const updated = { ...productChoices, [key]: altName };
    setProductChoices(updated);
    localStorage.setItem(CHOICES_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CHOICES_EVENT, { detail: updated }));
  };

  const selectedFf = FAST_FOOD_PICKS.find((f) => f.id === selectedFfId) ?? null;

  return (
    <CollapsibleSection title="Тижневий розклад" emoji="🗓️">
      <div className="overflow-x-auto">
        <table className="table-fixed w-full border-separate border-spacing-2 text-left">
          <thead>
            <tr>
              <th className="p-3 text-xs font-bold uppercase text-white bg-[#2a2d3e] border border-[#3e4158] w-12 rounded-lg">День</th>
              {MEAL_ORDER.map((type) => (
                <th key={type} className="p-3 text-xs font-bold uppercase text-white bg-[#2a2d3e] border border-[#3e4158] w-[22%] rounded-lg">
                  {type}
                </th>
              ))}
              <th className="p-3 text-xs font-bold uppercase text-white bg-[#2a2d3e] border border-[#3e4158] w-[12%] rounded-lg">
                <div>ккал</div>
                <div className="text-[10px] normal-case font-normal text-gray-400 mt-0.5">їжа / ціль</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {WEEKLY_SCHEDULE.map((row) => {
              let dayYouKcal = 0;
              let dayHerKcal = 0;

              const mealCells = MEAL_ORDER.map((type) => {
                if (row.day === "Пт" && type === "Вечеря") {
                  if (selectedFf) {
                    dayYouKcal += calcFfKcal(selectedFf, "you");
                    dayHerKcal += calcFfKcal(selectedFf, "her");
                  }
                  return { type, isFastFood: true as const };
                }

                const variants = MEAL_VARIANTS[type] ?? [];
                const activeVariant = variants.find((v) => v.name === (row.defaults[type] ?? "")) ?? null;
                const style = MEAL_TYPE_STYLE[type];

                if (activeVariant) {
                  dayYouKcal += calcMealKcal(activeVariant, "you", row.day, type, productChoices);
                  dayHerKcal += calcMealKcal(activeVariant, "her", row.day, type, productChoices);
                }

                return { type, isFastFood: false as const, activeVariant, style };
              });

              return (
                <tr key={row.day}>
                  <td className={`p-3 text-sm font-bold border border-[#3e4158] text-center align-middle rounded-lg ${
                    row.isWeekend ? "bg-[#6c63ff20] text-[#8b83ff]" : "bg-[#1e2130] text-white"
                  }`}>
                    <div>{row.day}</div>
                    <div className="text-xs mt-0.5">{row.activity === "gym" ? "💪" : "🏃"}</div>
                  </td>

                  {mealCells.map((cell) => {
                    if (cell.isFastFood) {
                      return (
                        <td key={cell.type} className={`p-3 px-4 rounded-lg align-top border-2 ${selectedFf ? "border-[#f7a948]/60 bg-[#f7a948]/10" : "border-dashed border-[#f7a948]/40 bg-[#1e2130]/50"}`}>
                          {selectedFf ? (
                            <>
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#f7a948]/30">
                                <span className="text-lg leading-none">{selectedFf.icon}</span>
                                <span className="text-xs font-bold text-[#f7a948]">{selectedFf.name}</span>
                              </div>
                              <table className="w-full text-left border-separate border-spacing-y-1 mb-2">
                                <thead>
                                  <tr className="text-[7px] uppercase text-[#f7a948]/40 tracking-widest">
                                    <th className="font-normal pb-0.5">Продукт</th>
                                    <th className="font-normal pb-0.5 text-right w-8">В</th>
                                    <th className="font-normal pb-0.5 text-right w-8">О</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedFf.items.filter((i) => !i.isBase).map((i) => (
                                    <tr key={i.name}>
                                      <td className="align-top py-0.5 text-[10px] text-gray-300 leading-tight">
                                        <div className="flex items-start gap-1">
                                          <span className="w-1 h-1 rounded-full bg-[#f7a948]/30 mt-1 shrink-0" />
                                          {i.name}
                                        </div>
                                      </td>
                                      <td className="text-[9px] text-gray-500 text-right align-top py-0.5 tabular-nums">1п</td>
                                      <td className="text-[9px] text-gray-500 text-right align-top py-0.5 tabular-nums">1п</td>
                                    </tr>
                                  ))}
                                  {selectedFf.baseName && (
                                    <tr>
                                      <td colSpan={3} className="text-[9px] text-[#f7a948]/60 italic pt-1">+ {selectedFf.baseName}</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </>
                          ) : (
                            <div className="text-xs font-mono text-[#f7a948]/60 mb-2">🍔 Обрати варіант</div>
                          )}
                          <div className="flex flex-wrap gap-1.5">
                            {FAST_FOOD_PICKS.map((ff) => (
                              <button
                                key={ff.id}
                                onClick={() => selectFf(ff.id)}
                                title={ff.name}
                                className={`text-xs px-2 py-1 rounded transition-colors leading-none ${
                                  selectedFfId === ff.id
                                    ? "bg-[#f7a948] text-[#1a1d27] font-bold"
                                    : "bg-[#f7a948]/15 text-[#f7a948]/80 hover:bg-[#f7a948]/30"
                                }`}
                              >
                                {ff.icon} {ff.shortName}
                              </button>
                            ))}
                          </div>
                        </td>
                      );
                    }

                    const { type: mealType, activeVariant, style } = cell;

                    if (!activeVariant) {
                      return (
                        <td key={cell.type} className="p-3 border border-dashed border-[#3e4158] bg-[#1e2130]/30 rounded-lg align-middle">
                          <span className="text-xs font-mono text-gray-500">— —</span>
                        </td>
                      );
                    }

                    const productsWithIdx = activeVariant.products.map((p, idx) => ({ p, idx }));
                    const main = productsWithIdx.filter(({ p }) => !isSauceOrSpice(p.name) && p.youGrams + p.herGrams > 0);
                    const sauces = productsWithIdx.filter(({ p }) => isSauceOrSpice(p.name) || p.youGrams + p.herGrams === 0);

                    return (
                      <td key={cell.type} className="p-3 px-4 border border-[#4a4d65] bg-[#1e2130] rounded-lg align-top">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#3e4158]">
                          <span className="text-lg leading-none">{activeVariant.icon}</span>
                          <span className="text-xs font-bold text-white uppercase tracking-tight">{activeVariant.name}</span>
                        </div>

                        <div className="mb-2">
                          <table className="w-full text-left border-separate border-spacing-y-1">
                            <thead>
                              <tr className="text-[7px] uppercase text-muted/60 tracking-widest">
                                <th className="font-normal pb-0.5">Продукт</th>
                                <th className="font-normal pb-0.5 text-right w-8">В</th>
                                <th className="font-normal pb-0.5 text-right w-8">О</th>
                              </tr>
                            </thead>
                            <tbody>
                              {main.map(({ p, idx }) => {
                                const allOpts = [p.name, ...(p.alts ?? [])];
                                const selectedProd = productChoices[`${row.day}-${mealType}-${idx}`] ?? p.name;

                                return (
                                  <tr key={idx} className="group">
                                    <td className="align-top py-0.5">
                                      {allOpts.length === 1 ? (
                                        <div className="text-[10px] text-gray-200 leading-tight flex items-start gap-1">
                                          <span className="w-1 h-1 rounded-full bg-white/20 mt-1 shrink-0" />
                                          <span className="flex-1">{selectedProd}</span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col gap-1">
                                          <div className="flex flex-wrap gap-1">
                                            {allOpts.map((opt) => (
                                              <button
                                                key={opt}
                                                onClick={() => selectProductAlt(row.day, mealType, idx, opt)}
                                                className={`text-[9px] px-1.5 py-0.5 rounded transition-colors leading-none border ${
                                                  selectedProd === opt 
                                                    ? `${style.active} border-transparent` 
                                                    : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                                                }`}
                                              >
                                                {opt}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                    <td className="text-[9px] text-gray-400 text-right align-top py-1 tabular-nums">
                                      {p.youGrams > 0 ? `${p.youGrams}г` : "—"}
                                    </td>
                                    <td className="text-[9px] text-gray-400 text-right align-top py-1 tabular-nums">
                                      {p.herGrams > 0 ? `${p.herGrams}г` : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {sauces.length > 0 && (
                          <div className="mt-2 pt-1 border-t border-[#3e4158]/50">
                            <div className="flex flex-col gap-1">
                              {sauces.map(({ p, idx }) => {
                                const allOpts = [p.name, ...(p.alts ?? [])];
                                const selectedProd = productChoices[`${row.day}-${mealType}-${idx}`] ?? p.name;
                                const icon = spiceIcon(p.name);

                                return (
                                  <div key={idx} className="flex items-start gap-1.5">
                                    <span className="text-[10px] leading-none mt-0.5 shrink-0 opacity-60">
                                      {icon || "•"}
                                    </span>
                                    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                                      {allOpts.map((opt) => (
                                        <button
                                          key={opt}
                                          onClick={() => selectProductAlt(row.day, mealType, idx, opt)}
                                          className={`text-[9px] px-1.5 py-0.5 rounded transition-colors leading-none ${
                                            selectedProd === opt ? style.active : "text-gray-500 hover:text-gray-300"
                                          }`}
                                        >
                                          {opt}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-3 px-4 border border-[#3e4158] bg-[#1e2130] rounded-lg align-middle">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-[#818cf8] uppercase">Він</div>
                        <div className="text-sm font-bold text-[#818cf8] bg-[#818cf8]/10 border border-[#818cf8]/30 rounded px-2 py-1 text-center">
                          {dayYouKcal} / {YOU_KCAL_TARGET}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-[#fb7185] uppercase">Вона</div>
                        <div className="text-sm font-bold text-[#fb7185] bg-[#fb7185]/10 border border-[#fb7185]/30 rounded px-2 py-1 text-center">
                          {dayHerKcal} / {HER_KCAL_TARGET}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
};
