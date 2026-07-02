import { ClipboardList, Flame } from "lucide-react";

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
        "Дістати все м'ясо, розкласти на столі. Підготувати 5 мисок.",
        "Серця промити, натискаючи пальцями — видалити залишки крові.",
        "Відбивну накрити плівкою і відбити молотком з обох боків.",
        "Куряче стегно для шашликів нарізати шматками 2–3 см.",
        "Зробити всі маринади і замаринувати м'ясо поспіль: йогуртово-лимонний (шашлики), соєво-томатний (серця), соєво-часниковий (смаження), медово-гірчичний (запікання), цитрусово-розмариновий (відбивна).",
      ],
    },
    {
      title: "Блок 2 — Поки м'ясо маринується (~10 хв активно)",
      steps: [
        "Сирники: розім'яти творог → замісити тісто → сформувати 10 заготовок.",
        "Викласти заготовки сирників на дошку та поставити в морозилку (смажити свіжими безпосередньо перед прийомом їжі).",
      ],
    },
    {
      title: "Фінал",
      steps: [
        "М'ясо розфасувати по контейнерах за днями, підписати — в холодильник або морозилку.",
      ],
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
    </div>
  );
}
