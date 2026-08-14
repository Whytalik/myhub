import { ClipboardList, Flame, Apple } from "lucide-react";
import { highlightProductMentions } from "../highlight-products";
import { getProductName, PRODUCTS } from "../products";
import { sumMacroGramsForSetsMulti, formatGrams } from "../quantities";
import type { ComputedQuantity } from "../types";

interface RecipeIngredient {
  food: string;
  qualifier?: string;
  qty?: string;
  computedQty?: ComputedQuantity;
}

/** Base name always comes from products.ts — `qualifier` adds prep-specific
 *  context (day, fat %, dish) that products.ts has no reason to track. */
function productLabel(food: string, qualifier?: string): string {
  const base = getProductName(food);
  return qualifier ? `${base} (${qualifier})` : base;
}

/** Same computed/manual duality as ShoppingList's `displayNameOf` — a computed
 *  qty is `sumMacroGramsForSetsMulti(...) + grams` formatted, never a hand-typed string. */
function quantityLabel(computed: ComputedQuantity, seasonOverride?: string): string {
  const baseTotal =
    sumMacroGramsForSetsMulti(
      [computed.food, ...(computed.extraFood ?? [])],
      computed.sets,
      undefined,
      seasonOverride,
    ) + (computed.grams ?? 0);
  const total = baseTotal * (1 + (computed.wastePercent ?? 0) / 100);
  return formatGrams(total, computed.unit, PRODUCTS[computed.food]?.gramsPerPiece);
}

function ingredientLabel(ing: RecipeIngredient, seasonOverride?: string): string {
  const label = productLabel(ing.food, ing.qualifier);
  const qty = ing.computedQty ? quantityLabel(ing.computedQty, seasonOverride) : ing.qty;
  return qty ? `${label} — ${qty}` : label;
}

const proteinIngredients: RecipeIngredient[] = [
  {
    food: "chickenMarinated",
    computedQty: {
      food: "chickenMarinated",
      sets: [{ set: "set1" }, { set: "set4" }, { set: "set5" }, { set: "set6" }],
      wastePercent: 5,
    },
  },
  {
    food: "chickenHearts",
    computedQty: { food: "chickenHearts", sets: [{ set: "set2" }], wastePercent: 15 },
  },
  {
    food: "porkChop",
    computedQty: { food: "porkChop", sets: [{ set: "set7" }], wastePercent: 10 },
  },
  { food: "mackerel", computedQty: { food: "mackerel", sets: [{ set: "set3", day: 1 }] } },
  { food: "cottageCheese", qualifier: "5–9%", qty: "500 г, для сирників" },
  {
    food: "eggs",
    qualifier: "для сирників",
    computedQty: { food: "eggs", sets: [], grams: 60, unit: "piece" },
  },
];

const marinadeIngredients: RecipeIngredient[] = [
  { food: "yogurtGreek", qty: "150 г" },
  { food: "lemon", qty: "1 шт" },
  { food: "garlic", qty: "10 зубчиків" },
  { food: "soySauce", qty: "6 ст.л." },
  { food: "tomatoPaste", qty: "1 ст.л." },
  { food: "honey", qty: "1 ст.л." },
  { food: "mustardDijon", qty: "2 ст.л." },
  { food: "oil", qualifier: "оливкова", qty: "~6 ст.л." },
  { food: "flour", qty: "5–6 ст.л." },
  { food: "sugar", qty: "3 ст.л." },
  { food: "vanillaSugar" },
  { food: "rosemary" },
  { food: "thyme" },
  { food: "paprika" },
  { food: "provencalHerbs" },
  { food: "fishSeasoning" },
  { food: "salt" },
  { food: "blackPepper" },
];

interface MealPrepProps {
  seasonOverride?: string;
}

export function MealPrep({ seasonOverride }: MealPrepProps) {
  const prepTable: (RecipeIngredient & { marinade: string })[] = [
    {
      food: "chickenMarinated",
      qualifier: "шашлики — Сет1",
      computedQty: { food: "chickenMarinated", sets: [{ set: "set1" }] },
      marinade: "Йогуртово-лимонний",
    },
    {
      food: "chickenHearts",
      qualifier: "Сет2",
      computedQty: { food: "chickenHearts", sets: [{ set: "set2" }] },
      marinade: "Соєво-томатний",
    },
    {
      food: "chickenMarinated",
      qualifier: "смажена курка — Сет4",
      computedQty: { food: "chickenMarinated", sets: [{ set: "set4" }] },
      marinade: "Соєво-часниковий",
    },
    {
      food: "chickenMarinated",
      qualifier: "запечене — Сет5 + Цезар Сет6",
      computedQty: { food: "chickenMarinated", sets: [{ set: "set5" }, { set: "set6" }] },
      marinade: "Медово-гірчичний",
    },
    {
      food: "porkChop",
      qualifier: "Сет7",
      computedQty: { food: "porkChop", sets: [{ set: "set7" }] },
      marinade: "Суха трав'яна база",
    },
    {
      food: "mackerel",
      qualifier: "Сет3, день 1",
      computedQty: { food: "mackerel", sets: [{ set: "set3", day: 1 }] },
      marinade: "Скумбрія з лимоном",
    },
  ];

  const shashlikQty = formatGrams(
    sumMacroGramsForSetsMulti(["chickenMarinated"], [{ set: "set1" }], undefined, seasonOverride),
  );
  const heartsQty = formatGrams(
    sumMacroGramsForSetsMulti(["chickenHearts"], [{ set: "set2" }], undefined, seasonOverride),
  );
  const fryQty = formatGrams(
    sumMacroGramsForSetsMulti(["chickenMarinated"], [{ set: "set4" }], undefined, seasonOverride),
  );
  const bakeQty = formatGrams(
    sumMacroGramsForSetsMulti(
      ["chickenMarinated"],
      [{ set: "set5" }, { set: "set6" }],
      undefined,
      seasonOverride,
    ),
  );
  const porkQty = formatGrams(
    sumMacroGramsForSetsMulti(["porkChop"], [{ set: "set7" }], undefined, seasonOverride),
  );

  const algorithm = [
    {
      title: "Блок 1 — Маринування (~20 хв)",
      steps: [
        "Дістати все м'ясо з холодильника, розкласти на робочій поверхні. Підготувати 5 глибоких мисок для маринування.",
        `Очищення: курячі серця (${heartsQty}) промити у друшляку, натискаючи пальцями для видалення згустків крові.`,
        `Відбивання: шматки свинячої відбивної (${porkQty}) накрити харчовою плівкою і відбити молотком з обох боків.`,
        `Нарізка: куряче філе для шашликів (${shashlikQty}) нарізати порційними шматочками розміром 2–3 см.`,
        `Миска 1: приготувати «Йогуртово-лимонний маринад» (рецепт нижче), додати куряче філе для шашликів (${shashlikQty}) та перемішати.`,
        `Миска 2: приготувати «Соєво-томатний маринад» (рецепт нижче), додати очищені курячі серця (${heartsQty}) та перемішати.`,
        `Миска 3: приготувати «Соєво-часниковий маринад» (рецепт нижче), додати куряче філе для смаження (${fryQty}) та перемішати.`,
        `Миска 4: приготувати «Медово-гірчичний маринад» (рецепт нижче), обмазати сумішшю куряче філе (${bakeQty}).`,
        `Без миски: приготувати «Суху трав'яну базу» (рецепт нижче), натерти сумішшю відбивні (${porkQty}) з обох боків.`,
        "Скумбрія: випотрошити 2 тушки, промити, зробити кілька поперечних надрізів на боках. Половину лимона нарізати тонкими півкружальцями і вставити в надрізи, посолити та натерти «Скумбрія з лимоном» (рецепт нижче). Щільно загорнути кожну тушку в фольгу.",
      ],
    },
    {
      title: "Блок 2 — Поки м'ясо маринується (~10 хв активно)",
      steps: [
        "Сирники (тісто): добре розім'яти 500 г творогу виделкою. Додати 1 яйце, 2–3 ст.л. цукру, 1 пакетик ванільного цукру, дрібку солі та ретельно перемішати. Поступово ввести 5–6 ст.л. борошна до отримання м'якого тіста.",
        "Сирники (формування): мокрими руками сформувати 10 кульок, обваляти їх у борошні та сформувати гарні заготовки сирників.",
        "Заморозка: викласти сформовані заготовки сирників на дошку, присипану борошном, та поставити в морозильну камеру (смажити свіжими перед прийомом).",
      ],
    },
    {
      title: "Фінал",
      steps: [
        "Фасування: замариноване м'ясо розкласти по герметичних контейнерах або пакетах, загорнуту в фольгу скумбрію покласти окремо — підписати все номерами сетів та відразу відправити в морозильну камеру.",
      ],
    },
  ];

  const marinades: { title: string; for: string; ingredients: RecipeIngredient[]; note: string }[] =
    [
      {
        title: "Йогуртово-лимонний маринад",
        for: "Для курячих шашликів (Сет1). Подача: гірчиця.",
        ingredients: [
          { food: "yogurtGreek", qty: "150 г" },
          { food: "lemon", qty: "сік ½ шт + цедра" },
          { food: "garlic", qty: "2 зубчики (тиском)" },
          { food: "paprika", qty: "1 ч.л." },
          { food: "provencalHerbs", qty: "½ ч.л." },
          { food: "oil", qualifier: "оливкова", qty: "1 ст.л." },
          { food: "salt" },
          { food: "blackPepper" },
        ],
        note: "Маринувати мінімум 2 год, ідеально — ніч у холодильнику.",
      },
      {
        title: "Соєво-томатний маринад",
        for: "Для курячих сердець (Сет2). Соус подачі: Соєва глазур",
        ingredients: [
          { food: "soySauce", qty: "3 ст.л." },
          { food: "tomatoPaste", qty: "1 ст.л." },
          { food: "oil", qualifier: "оливкова", qty: "1 ст.л." },
          { food: "provencalHerbs", qty: "½ ч.л." },
          { food: "blackPepper", qty: "сіль не потрібна — соєвий соус солоний" },
        ],
        note: "Маринувати 30–60 хв, перемішувати кожні 10 хв.",
      },
      {
        title: "Соєво-часниковий маринад",
        for: "Для смаженої курки (Сет4)",
        ingredients: [
          { food: "soySauce", qty: "3 ст.л." },
          { food: "oil", qualifier: "оливкова", qty: "1 ст.л." },
          { food: "garlic", qty: "2 зубчики (тиском)" },
          { food: "paprika", qty: "½ ч.л." },
          { food: "blackPepper" },
        ],
        note: "Маринувати від 1 до 4 год.",
      },
      {
        title: "Медово-гірчичний маринад",
        for: "Для запеченого курячого філе (Сет5 + Цезар Сет6). Утворює соус при запіканні.",
        ingredients: [
          { food: "mustardDijon", qty: "2 ст.л., французька зернова або діжонська" },
          { food: "honey", qty: "1 ст.л." },
          { food: "oil", qualifier: "оливкова", qty: "2 ст.л." },
          { food: "garlic", qty: "2 зубчики (тиском)" },
          { food: "salt" },
          { food: "blackPepper" },
        ],
        note: "Маринувати від 1 до 4 год. Запікати у фользі або рукаві при 180°C — 30–35 хв.",
      },
      {
        title: "Суха трав'яна база",
        for: "Для свинячої відбивної (Сет7). Соус подачі: Цибулево-вершковий",
        ingredients: [
          { food: "salt" },
          { food: "blackPepper" },
          { food: "rosemary", qty: "1 ч.л." },
          { food: "thyme", qty: "½ ч.л." },
          { food: "garlic", qty: "2 зубчики (тиском)" },
        ],
        note: "Без олії та рідини — натерти суху суміш з обох боків, дати полежати 15–30 хв перед смаженням.",
      },
      {
        title: "Скумбрія з лимоном",
        for: "Для запеченої скумбрії (Сет3, день 1). Одразу у фользі — готова з морозилки в духовку.",
        ingredients: [
          { food: "lemon", qty: "½ шт, тонкими півкружальцями в надрізи" },
          { food: "fishSeasoning", qty: "1 ч.л." },
          { food: "salt" },
        ],
        note: "Не розморожувати перед запіканням — просто запікати з морозилки, додавши ~10 хв до часу.",
      },
    ];

  const sectionIconClass =
    "flex items-center justify-center w-8 h-8 rounded-lg bg-accent-nutrition/10 text-accent-nutrition shrink-0";
  const ingredientItemClass = "flex items-start gap-1.5 text-sm text-zinc-300";

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <ClipboardList size={16} />
          </div>
          <div>
            <h3 className="text-panel-title">Підготовка їжі (Міл-преп)</h3>
            <p className="text-caption">
              Раз на 14 днів (у неділю) здійснюється закупка і підготовка білкових продуктів на весь
              цикл із 7 сетів — готуємо раз, їмо два дні поспіль
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-label text-left py-2 pr-3">М&apos;ясо</th>
                <th className="text-label text-left py-2 pr-3">Кількість</th>
                <th className="text-label text-left py-2">Маринад</th>
              </tr>
            </thead>
            <tbody>
              {prepTable.map((row, idx) => (
                <tr key={idx} className="border-b border-white/[0.03] last:border-0">
                  <td className="py-2 pr-3 text-zinc-200">
                    {productLabel(row.food, row.qualifier)}
                  </td>
                  <td className="py-2 pr-3 font-mono text-zinc-300">
                    {row.computedQty ? quantityLabel(row.computedQty, seasonOverride) : row.qty}
                  </td>
                  <td className="py-2 text-zinc-400">{row.marinade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <Apple size={16} />
          </div>
          <div>
            <h3 className="text-panel-title">Продукти для підготовки</h3>
            <p className="text-caption">Необхідні інгредієнти для міл-препу та заготовок</p>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-label block mb-2">М&apos;ясо та білки</span>
            <ul className="flex flex-col gap-1.5">
              {proteinIngredients.map((ing, idx) => (
                <li key={idx} className={ingredientItemClass}>
                  <span className="text-zinc-600">·</span>
                  <span>{ingredientLabel(ing, seasonOverride)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-label block mb-2">Маринади та спеції</span>
            <ul className="flex flex-col gap-1.5">
              {marinadeIngredients.map((ing, idx) => (
                <li key={idx} className={ingredientItemClass}>
                  <span className="text-zinc-600">·</span>
                  <span>{ingredientLabel(ing, seasonOverride)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <span className="text-panel-title">
          Алгоритм великого мілпрепу (~40 хв активно, раз на 14 днів)
        </span>
        <div className="flex flex-col gap-4">
          {algorithm.map((block, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-accent-nutrition">
                <Flame size={13} />
                {block.title}
              </span>
              <ol className="flex flex-col gap-1">
                {block.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="font-mono text-xs text-zinc-500 shrink-0">{stepIdx + 1}.</span>
                    <span>{highlightProductMentions(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <span className="text-panel-title">Рецепти маринадів</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marinades.map((m, idx) => (
            <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02]">
              <span className="text-sm font-semibold text-zinc-100">{m.title}</span>
              <p className="text-caption">{m.for}</p>
              <ul className="flex flex-col gap-1">
                {m.ingredients.map((ing, ingIdx) => (
                  <li key={ingIdx} className="flex items-start gap-1.5 text-sm text-zinc-300">
                    <span className="text-zinc-600">·</span>
                    <span>{ingredientLabel(ing, seasonOverride)}</span>
                  </li>
                ))}
              </ul>
              {m.note && <p className="text-caption italic">{m.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
