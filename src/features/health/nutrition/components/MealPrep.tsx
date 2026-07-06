import { ClipboardList, Flame, Apple } from "lucide-react";
import { highlightProductMentions } from "../highlight-products";

const proteinIngredients = [
  "Куряче стегно або філе — 1.48 кг",
  "Куряче філе — 1.1 кг",
  "Курячі серця — 600 г",
  "Свиняча відбивна — 600 г (~4 шт)",
  "Творог 5–9% — 500 г (для сирників)",
  "Яйце — 1 шт (для сирників)",
];

const marinadeIngredients = [
  "Грецький йогурт — 150 г",
  "Лимон — ½ шт",
  "Часник — 10 зубчиків",
  "Соєвий соус — 6 ст.л., Томатна паста — 1 ст.л.",
  "Мед — 1 ст.л., Гірчиця — 2 ст.л.",
  "Оливкова олія — ~6 ст.л.",
  "Борошно — 5–6 ст.л., Цукор — 3 ст.л., Ванільний цукор",
  "Розмарин, чебрець, паприка, прованські трави, сіль, перець",
];

export function MealPrep() {
  const prepTable = [
    { name: "Куряче стегно або філе (шашлики — Пн)", qty: "800 г", marinade: "Йогуртово-лимонний" },
    { name: "Курячі серця (Вт)", qty: "600 г", marinade: "Соєво-томатний" },
    {
      name: "Куряче стегно або філе (смажена курка — Чт)",
      qty: "680 г",
      marinade: "Соєво-часниковий",
    },
    { name: "Куряче філе (запечене — Пт + Цезар Сб)", qty: "1100 г", marinade: "Медово-гірчичний" },
    { name: "Свиняча відбивна (Нд)", qty: "600 г (~4 шт)", marinade: "Суха трав'яна база" },
  ];

  const algorithm = [
    {
      title: "Блок 1 — Маринування (~20 хв)",
      steps: [
        "Дістати все м'ясо з холодильника, розкласти на робочій поверхні. Підготувати 5 глибоких мисок для маринування.",
        "Очищення: курячі серця (600 г) промити у друшляку, натискаючи пальцями для видалення згустків крові.",
        "Відбивання: шматки свинячої відбивної (600 г) накрити харчовою плівкою і відбити молотком з обох боків.",
        "Нарізка: куряче стегно для шашликів (800 г) нарізати порційними шматочками розміром 2–3 см.",
        "Миска 1 (Йогуртово-лимонний): змішати грецький йогурт 150 г, сік ½ лимона + подрібнену цедру, 2 вичавлені зубчики часнику, 1 ч.л. паприки, ½ ч.л. прованських трав, 1 ст.л. оливкової олії, сіль та чорний перець. Додати куряче стегно (800 г) та перемішати.",
        "Миска 2 (Соєво-томатний): змішати соєвий соусу 3 ст.л., томатну пасту 1 ст.л., оливкову олію 1 ст.л., ½ ч.л. прованських трав та чорний перець. Додати очищені курячі серця (600 г) та перемішати.",
        "Миска 3 (Соєво-часниковий): змішати соєвий соусу 3 ст.л., оливкову олію 1 ст.л., 2 вичавлені зубчики часнику, ½ ч.л. паприки та чорний перець. Додати куряче стегно/філе для смаження (680 г) та перемішати.",
        "Миска 4 (Медово-гірчичний): змішати гірчицю 2 ст.л., мед 1 ст.л., оливкову олію 2 ст.л., 2 вичавлені зубчики часнику, сіль та чорний перець. Обмазати сумішшю куряче філе (1.1 кг).",
        "Суха база (без миски): змішати сіль, чорний перець, 1 ч.л. сухого розмарину, ½ ч.л. чебрецю та 2 подрібнені зубчики часнику. Натерти сумішшю відбивні (600 г) з обох боків — без олії та рідини.",
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
        "Фасування: замариноване м'ясо розкласти по герметичних контейнерах або пакетах, підписати дні тижня та відразу відправити в морозильну камеру.",
      ],
    },
  ];

  const marinades = [
    {
      title: "Йогуртово-лимонний маринад",
      for: "Для курячих шашликів (Пн). Соус подачі: Часниково-йогуртовий",
      ingredients: [
        "150 г грецького йогурту",
        "сік ½ лимона + цедра",
        "2 зубчики часнику (тиском)",
        "1 ч.л. паприки",
        "½ ч.л. прованських трав",
        "1 ст.л. оливкової олії",
        "сіль, чорний перець",
      ],
      note: "Маринувати мінімум 2 год, ідеально — ніч у холодильнику.",
    },
    {
      title: "Соєво-томатний маринад",
      for: "Для курячих сердець (Вт). Соус подачі: Соєва глазур",
      ingredients: [
        "3 ст.л. соєвого соусу",
        "1 ст.л. томатної пасти",
        "1 ст.л. оливкової олії",
        "½ ч.л. прованських трав",
        "чорний перець (сіль не потрібна — соєвий соус солоний)",
      ],
      note: "Маринувати 30–60 хв, перемішувати кожні 10 хв.",
    },
    {
      title: "Соєво-часниковий маринад",
      for: "Для смаженої курки (Чт)",
      ingredients: [
        "3 ст.л. соєвого соусу",
        "1 ст.л. оливкової олії",
        "2 зубчики часнику (тиском)",
        "½ ч.л. паприки",
        "чорний перець",
      ],
      note: "Маринувати від 1 до 4 год.",
    },
    {
      title: "Медово-гірчичний маринад",
      for: "Для запеченого курячого філе (Пт). Утворює соус при запіканні.",
      ingredients: [
        "2 ст.л. гірчиці (французька зернова або діжонська)",
        "1 ст.л. меду",
        "2 ст.л. оливкової олії",
        "2 зубчики часнику (тиском)",
        "сіль, чорний перець",
      ],
      note: "Маринувати від 1 до 4 год. Запікати у фользі або рукаві при 180°C — 30–35 хв.",
    },
    {
      title: "Суха трав'яна база",
      for: "Для свинячої відбивної (Нд). Соус подачі: Цибулево-вершковий",
      ingredients: [
        "сіль, чорний перець",
        "1 ч.л. сухого розмарину",
        "½ ч.л. чебрецю",
        "2 зубчики часнику (тиском)",
      ],
      note: "Без олії та рідини — натерти суху суміш з обох боків, дати полежати 15–30 хв перед смаженням.",
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
              В неділю здійснюється закупка і підготовка білкових продуктів на весь тиждень
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
                  <td className="py-2 pr-3 text-zinc-200">{highlightProductMentions(row.name)}</td>
                  <td className="py-2 pr-3 font-mono text-zinc-300">{row.qty}</td>
                  <td className="py-2 text-zinc-400">{highlightProductMentions(row.marinade)}</td>
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
                  <span>{highlightProductMentions(ing)}</span>
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
                  <span>{highlightProductMentions(ing)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <span className="text-panel-title">Алгоритм неділі (~40 хв активно)</span>
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
              <p className="text-caption">{highlightProductMentions(m.for)}</p>
              <ul className="flex flex-col gap-1">
                {m.ingredients.map((ing, ingIdx) => (
                  <li key={ingIdx} className="flex items-start gap-1.5 text-sm text-zinc-300">
                    <span className="text-zinc-600">·</span>
                    <span>{highlightProductMentions(ing)}</span>
                  </li>
                ))}
              </ul>
              {m.note && <p className="text-caption italic">{highlightProductMentions(m.note)}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
