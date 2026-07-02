import { ClipboardList, Flame, Apple } from "lucide-react";

export function MealPrep() {
  const prepTable = [
    { name: "Куряче стегно або філе (шашлики — Пн)", qty: "800 г", marinade: "Йогуртово-лимонний" },
    { name: "Курячі серця (Вт)", qty: "600 г", marinade: "Соєво-томатний" },
    { name: "Куряче стегно або філе (смажена курка — Чт)", qty: "680 г", marinade: "Соєво-часниковий" },
    { name: "Куряче філе (запечене — Пт + Цезар Сб)", qty: "1200 г", marinade: "Медово-гірчичний" },
    { name: "Свиняча відбивна (Нд)", qty: "600 г (~4 шт)", marinade: "Цитрусово-розмариновий" },
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
        "Миска 4 (Медово-гірчичний): змішати гірчицю 2 ст.л., мед 1 ст.л., оливкову олію 2 ст.л., 2 вичавлені зубчики часнику, сіль та чорний перець. Обмазати сумішшю куряче філе (1.2 кг).",
        "Миска 5 (Цитрусово-розмариновий): змішати сік 1 апельсина (або 1 лимона), оливкову олію 3 ст.л., 2 вичавлені зубчики часнику, 1 ч.л. розмарину, ½ ч.л. чебрецю, сіль та чорний перець. Обмазати відбивні (600 г).",
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
      title: "Цитрусово-розмариновий маринад",
      for: "Для свинячої відбивної (Нд). Соус подачі: Цибулево-вершковий",
      ingredients: [
        "сік 1 апельсина (або 1 лимона)",
        "3 ст.л. оливкової олії",
        "2 зубчики часнику (тиском)",
        "1 ч.л. свіжого або сухого розмарину",
        "½ ч.л. чебрецю",
        "сіль, чорний перець",
      ],
      note: "Маринувати 2–4 год для тонких відбивних, до 8 год для товстих.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Card */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <ClipboardList size={16} />
          </div>
          <div>
            <h3 className="text-note font-semibold text-text-primary">Підготовка їжі (Міл-преп)</h3>
            <p className="text-caption text-text-muted">В неділю здійснюється закупка і підготовка білкових продуктів на весь тиждень</p>
          </div>
        </div>

        {/* Meat Prep Table */}
        <div className="mt-2 border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-caption text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border/50 text-text-secondary font-medium">
                <th className="p-3">М'ясо</th>
                <th className="p-3 text-right">Кількість</th>
                <th className="p-3">Маринад</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-text-secondary">
              {prepTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-hover/20">
                  <td className="p-3 font-medium text-text-primary">{row.name}</td>
                  <td className="p-3 text-right font-mono">{row.qty}</td>
                  <td className="p-3 text-accent font-medium">{row.marinade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products list for Prep */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Apple size={16} />
          </div>
          <div>
            <h3 className="text-note font-semibold text-text-primary">Продукти для підготовки</h3>
            <p className="text-caption text-text-muted">Необхідні інгредієнти для міл-препу та заготовок</p>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-caption">
          <div>
            <span className="font-semibold text-text-primary uppercase tracking-wider font-mono text-[11px] block mb-2 text-accent">
              М'ясо та білки
            </span>
            <ul className="flex flex-col gap-1.5 pl-1 text-text-secondary">
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Куряче стегно або філе — 1.48 кг</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Куряче філе — 1.2 кг</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Курячі серця — 600 г</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Свиняча відбивна — 600 г (~4 шт)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Творог 5–9% — 500 г (для сирників)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Яйце — 1 шт (для сирників)</span>
              </li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-text-primary uppercase tracking-wider font-mono text-[11px] block mb-2 text-accent">
              Маринади та спеції
            </span>
            <ul className="flex flex-col gap-1.5 pl-1 text-text-secondary">
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Грецький йогурт — 150 г</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Лимон — 1.5 шт, Апельсин — 1 шт</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Часник — 10 зубчиків</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Соєвий соус — 6 ст.л., Томатна паста — 1 ст.л.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Мед — 1 ст.л., Гірчиця — 2 ст.л.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Оливкова олія — ~9 ст.л.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Борошно — 5–6 ст.л., Цукор — 3 ст.л., Ванільний цукор</span>
              </li>
              <li className="flex gap-2">
                <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                <span>Розмарин, чебрець, паприка, прованські трави, сіль, перець</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Algorithm */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
        <span className="text-caption font-semibold text-text-primary uppercase tracking-wider font-mono">
          Алгоритм неділі (~40 хв активно)
        </span>
        <div className="flex flex-col gap-5">
          {algorithm.map((block, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <span className="text-caption font-semibold text-accent flex items-center gap-1.5">
                <Flame size={13} className="shrink-0" />
                {block.title}
              </span>
              <ol className="flex flex-col gap-2.5 pl-1">
                {block.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="text-caption text-text-secondary leading-relaxed flex gap-2">
                    <span className="text-text-muted shrink-0 font-mono font-bold">{stepIdx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {/* Marinades */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <span className="text-caption font-semibold text-text-primary uppercase tracking-wider font-mono">
          Рецепти маринадів
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marinades.map((m, idx) => (
            <div key={idx} className="border border-border/40 rounded-xl p-4 flex flex-col gap-2 bg-surface/50">
              <span className="text-caption font-semibold text-accent">
                {m.title}
              </span>
              <p className="text-caption text-text-muted italic mb-1">
                {m.for}
              </p>
              <ul className="flex flex-col gap-1 pl-1">
                {m.ingredients.map((ing, ingIdx) => (
                  <li key={ingIdx} className="text-caption text-text-secondary leading-relaxed flex gap-2">
                    <span className="text-accent/60 shrink-0 font-bold font-mono">·</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
              {m.note && (
                <p className="text-caption text-text-muted mt-2 border-t border-border/20 pt-2 leading-relaxed">
                  {m.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
