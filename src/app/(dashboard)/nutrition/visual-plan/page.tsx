import type { Metadata } from "next";
import { CollapsibleSection } from "../../../../features/nutrition/components/visual-plan/CollapsibleSection";
import { WeeklySchedule } from "../../../../features/nutrition/components/visual-plan/WeeklySchedule";
import { ShoppingList } from "../../../../features/nutrition/components/visual-plan/ShoppingList";

export const metadata: Metadata = {
  title: "Visual Plan",
};

const evaluationMetrics = [
  { label: "Калорійність", value: 5, color: "bg-[#43d98c]" },
  { label: "Білки", value: 5, color: "bg-[#6c63ff]" },
  { label: "Клітковина", value: 4, color: "bg-[#a78bfa]" },
  { label: "Мікронутрієнти", value: 4, color: "bg-[#2dd4bf]" },
  { label: "Ситість", value: 4, color: "bg-[#4fa3e0]" },
  { label: "Зручність", value: 5, color: "bg-[#f7a948]" },
  { label: "Різноманіття", value: 3, color: "bg-[#ff6584]" },
];

const profiles = [
  { name: "Віталій", kcal: "1700", goal: "схуднення", color: "text-[#6c63ff]", border: "border-[#6c63ff]/30" },
  { name: "Олеся", kcal: "2300", goal: "набір ваги", color: "text-[#ff6584]", border: "border-[#ff6584]/30" },
];

const schedule = [
  { t: "06:00", l: "Передтрен", i: "⚡", d: "Швидкі вуглеводи", c: "border-b-[#43d98c]" },
  { t: "08:30", l: "Сніданок", i: "🍳", d: "Білок + овочі", c: "border-b-[#6c63ff]" },
  { t: "13:30", l: "Обід", i: "🥗", d: "Вуглеводи + протеїн", c: "border-b-[#f7a948]" },
  { t: "19:30", l: "Вечеря", i: "🌙", d: "Легкий білок", c: "border-b-[#ff6584]" },
];

const mealCategories = [
  {
    title: "⚡ Передтрен (06:00)",
    color: "text-[#43d98c]",
    border: "border-[#43d98c]/30",
    variants: [
      { name: "Класика", icon: "🍯", products: ["Рисові хлібці", "Мед", "Теплий чай"] },
      { name: "Енергія", icon: "🍌", products: ["Банан стиглий", "Теплий чай"] },
      { name: "Баланс", icon: "🥨", products: ["Солона соломка", "Теплий чай"] },
      { name: "Ситність", icon: "🥖", products: ["Батон", "Мед", "Теплий чай"] },
    ]
  },
  {
    title: "🍳 Сніданок (08:30)",
    color: "text-[#6c63ff]",
    border: "border-[#6c63ff]/30",
    variants: [
      { name: "Сирні панкейки", icon: "🥞", products: ["Сир кисломолочний", "Яйце", "ЦЗ Борошно", "Яблуко / Груша / Вишня замор. / Чорниця замор.", "Кориця", "Ванілін"] },
      { name: "Білковий омлет", icon: "🍳", products: ["Яйця", "Яєчні білки", "Куряче філе", "Помідор / Мікс овочей", "ЦЗ Хліб", "Насіння льону", "Соєвий соус", "Часник", "Олія"] },
      { name: "Тости з тунцем", icon: "🐟", products: ["Тунець у вл. соку", "ЦЗ Хліб", "Яйце варене", "Огірок / Зелена цибуля", "Насіння льону", "🥣 Гірчиця"] },
      { name: "Breakfast Wrap", icon: "🌯", products: ["Лаваш тонкий", "Куряче філе", "Яйце-скрембл", "Айсберг / Огірок", "Насіння льону", "Помідор", "Цибуля червона", "🥣 Сальса"] },
    ]
  },
  {
    title: "🥗 Обід (13:30)",
    color: "text-[#f7a948]",
    border: "border-[#f7a948]/30",
    variants: [
      { name: "Зібраний Боул", icon: "🥣", products: ["Гречка / Рис / Булгур", "Куряче філе / Тунець консерва", "Морква", "Огірок", "Помідор", "Яблуко / Груша", "Олія оливкова / Арахіс смажений", "Соєвий соус", "Часник", "Рисовий оцет", "Мед"] },
      { name: "Паста-конструктор", icon: "🍝", products: ["Макарони ТЗ", "Куряче філе / Яловичий фарш", "Томатна пасата", "Цибуля", "Морква", "Часник", "Твердий сир", "🥣 Орегано + Базилік"] },
      { name: "Зігріваючий Суп", icon: "🍲", products: ["Червона сочевиця / Нут", "Куряче філе", "Картопля", "Морква", "Цибуля", "Петрушка / Кріп", "Олія оливкова", "Куркума", "Лавровий лист"] },
      { name: "Печена тарілка", icon: "🐟", products: ["Картопля печена", "Хек / Тилапія / Куряче стегно", "Морква по-корейськи / Капуста", "🧂 Олійно-паприковий", "🥣 Ткемалі"] },
    ]
  },
  {
    title: "🌙 Вечеря (19:30)",
    color: "text-[#ff6584]",
    border: "border-[#ff6584]/30",
    variants: [
      { name: "Овочеве Рагу", icon: "🍛", products: ["Куряче філе / Яловичий фарш", "Морква / Кабачок / Перець", "Квасоля / Нут", "Томатна паста", "Часник", "Олія оливкова", "🧂 Паприка + Лавровий лист"] },
      { name: "Солодкий Сир", icon: "🍓", products: ["Сир кисломолочний", "Яблуко / Груша / Вишня замор. / Чорниця замор.", "Арахіс / Насіння льону", "Мед", "Кориця"] },
      { name: "Риба + Зелень", icon: "🥦", products: ["Хек / Тилапія / Мінтай", "Гречка / Рис", "Броколі зам. / Цвітна капуста зам.", "Олія оливкова", "Кріп", "Часник", "Хрін тертий", "Грецький йогурт"] },
      { name: "Протеїновий Салат", icon: "🥗", products: ["Тунець / Курка / Яйця", "Айсберг / Пекінська капуста (200г+)", "Огірок / Помідор", "Олія оливкова (1 ч.л.)", "🥣 Цацікі"] },
      { name: "Smart Fast Food", icon: "🍔", products: ["Суші (без майонезу) / Роли", "Бургер (крафтовий, 1 патті)", "Шаурма (без майонезу/фрі)", "Піца (тонке тісто, 2 шм)"] },
    ]
  },
];

const fastFoodOptions = [
  {
    name: "Суші / Роли", icon: "🍣", place: "Домашні",
    items: [
      { who: "both", name: "Класичний рол", ing: ["Норі", "Рис суші + рисовий оцет", "Лосось / Форель", "Плавлений сир", "Огірок"] }
    ]
  },
  {
    name: "Бургер", icon: "🍔", place: "McDonald's",
    items: [
      { who: "you", name: "Чізбургер", ing: ["Яловичина", "Чеддер", "Маринований огірок", "Цибуля", "Гірчиця + кетчуп"] },
      { who: "you", name: "Біг Мак", ing: ["2× яловичина", "Чеддер", "Айсберг", "Цибуля", "Огірок", "Big Mac соус"] },
      { who: "her", name: "МакКріспі Делюкс", ing: ["Ціле куряче філе", "Айсберг", "Чеддер", "Томат", "Огірок", "Кисло-солодкий соус"] },
    ]
  },
  {
    name: "Кебаб", icon: "🌯", place: "I Love Kebab",
    items: [
      { who: "both", name: "Класичний", ing: ["Лаваш", "Курка", "Томат", "Айсберг", "Цибуля", "Напівгострий соус"] },
      { who: "both", name: "Black & White", ing: ["Лаваш", "Курка", "Твердий сир", "Печериці", "Томат", "Айсберг", "Соус"] },
      { who: "both", name: "Фрі кебаб", ing: ["Курка", "Картопля фрі (L)", "Айсберг", "Томат", "Цибуля", "Домашній соус"] },
    ]
  },
  {
    name: "Піца", icon: "🍕", place: "Піцерія Маріо",
    items: [
      { who: "both", name: "Вілла д'Есте", ing: ["Томатний + бешамель", "Моцарела", "Куряче філе", "Бекон", "Печериці", "Соус Песто"] },
      { who: "both", name: "Сімона", ing: ["Бешамель", "Моцарела", "Куряче філе", "Бекон", "Ананас", "Чеддер"] },
    ]
  },
];

const marinades = [
  { name: "Соєво-часниковий", used: ["Омлет", "Боул"], ing: ["Соєвий соус — 2 ст.л.", "Часник — 2 зуб.", "Олія — 1 ст.л.", "Чорний перець"] },
  { name: "Паприково-олійний", used: ["Wrap"], ing: ["Олія — 2 ст.л.", "Паприка солодка — 1 ч.л.", "Часник — 1 зуб.", "Сіль — ½ ч.л."] },
  { name: "Олійно-паприковий", used: ["Печена тарілка"], ing: ["Олія — 2 ст.л.", "Паприка — 1 ч.л.", "Сіль, перець — до смаку"] },
  { name: "Олія + Кріп + Часник", used: ["Риба + Зелень"], ing: ["Олія оливкова — 2 ст.л.", "Кріп — 2 ст.л.", "Часник — 2 зуб.", "Сіль — ½ ч.л."] },
  { name: "Паприка + Лавровий", used: ["Рагу"], ing: ["Олія — 2 ст.л.", "Паприка — 1 ч.л.", "Лавровий лист — 2 шт", "Перець — ½ ч.л."] },
];

const sauces = [
  { name: "Гірчиця", used: ["Тости з тунцем"], ing: ["Гірчиця — 1 ч.л."] },
  { name: "Орегано + Базилік", used: ["Паста"], ing: ["Орегано — ½ ч.л.", "Базилік — ½ ч.л.", "Олія — 1 ч.л."] },
  { name: "Цацікі", used: ["Протеїновий салат"], ing: ["Грецький йогурт — 3 ст.л.", "Огірок — ½ шт", "Часник — 1 зуб.", "Кріп — 1 ст.л."] },
  { name: "Сальса", used: ["Wrap"], ing: ["Помідор — 2 шт", "Цибуля червона — ¼ шт", "Часник — 1 зуб.", "Петрушка — 2 ст.л.", "Лимонний сік — 1 ч.л."] },
  { name: "Теріяки", used: ["Боул"], ing: ["Соєвий соус — 2 ст.л.", "Рисовий оцет — 1 ст.л.", "Мед — ½ ч.л.", "Часник — 1 зуб."] },
  { name: "Ткемалі", used: ["Печена тарілка"], ing: ["Ткемалі готовий — 2 ч.л."] },
  { name: "Хрін", used: ["Риба + Зелень"], ing: ["Хрін тертий — 1 ч.л.", "Грецький йогурт — 1 ст.л.", "Сіль — до смаку"] },
];

export default function VisualPlanPage() {
  return (
    <div className="px-6 md:px-14 py-6 w-full">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-lg font-heading text-text border-l-2 border-[#6c63ff] pl-3">
            Visual Plan
          </h1>
          <p className="text-[9px] font-mono text-muted uppercase tracking-tighter italic pl-4">
            Оцінка стратегії & Flow
          </p>
        </div>

        <div className="flex gap-4">
          {profiles.map((p) => (
            <div key={p.name} className={`bg-[#1a1d27] border ${p.border} rounded-lg px-4 py-2 flex items-baseline gap-2`}>
              <span className={`text-[11px] font-bold ${p.color}`}>{p.name}</span>
              <span className="text-xs font-bold text-text">{p.kcal} <span className="text-[9px] font-normal text-muted">ккал</span></span>
              <span className="text-[9px] text-muted italic">• {p.goal}</span>
            </div>
          ))}
        </div>
      </header>

      <div className="space-y-8">

        {/* Критерії оцінки */}
        <CollapsibleSection title="Оцінка плану" emoji="📊" defaultOpen={false}>
          <div className="flex items-center gap-1 bg-[#1a1d27] border border-[#2e3147] rounded-lg p-2 overflow-hidden">
            {evaluationMetrics.map((metric) => (
              <div key={metric.label} className="flex-1 flex flex-col gap-1 px-2 border-r border-[#2e3147] last:border-0">
                <span className="text-[8px] font-bold text-muted uppercase text-center">{metric.label}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i < metric.value ? metric.color : "bg-[#2e3147]"}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Денний розклад */}
        <CollapsibleSection title="Денний розклад" emoji="⏰">
          <div className="bg-[#1a1d27] border border-[#2e3147] rounded-lg p-3">
            <div className="flex gap-3">
              {schedule.map((m) => (
                <div key={m.l} className={`flex-1 border-b-2 ${m.c} bg-[#222535]/30 rounded p-2 flex items-center justify-between gap-4`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs">{m.i}</span>
                    <div>
                      <div className="text-[10px] font-bold text-text leading-none">{m.l}</div>
                      <div className="text-[9px] text-muted whitespace-nowrap">{m.d}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-muted shrink-0">{m.t}</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Правила тижня */}
        <CollapsibleSection title="Правила тижня" emoji="📋">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#1a1d27] border border-[#2e3147] rounded-lg p-3">
              <h2 className="text-[9px] font-bold uppercase text-muted mb-3 tracking-widest border-b border-[#2e3147] pb-1">Weekly Prep</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { r: "Генеральний Prep (Нд)", d: "Закупівля на тиждень, миття овочів, нарізка бази на 3 дні." },
                  { r: "Ротація маринадів", d: "5 видів для уникнення смакової рутини." },
                  { r: "Заморозка порцій", d: "М'ясо в пакетах — в морозилку; ввечері — в холодильник." },
                  { r: "Контроль (Нд)", d: "Зважування та замір об'ємів вранці натщесерце." }
                ].map((item) => (
                  <li key={item.r} className="flex flex-col gap-0.5">
                    <div className="text-[10px] font-bold text-text flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#6c63ff] shrink-0" /> {item.r}
                    </div>
                    <div className="text-[9px] text-muted pl-3 leading-tight">{item.d}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1a1d27] border border-[#2e3147] rounded-lg p-3">
              <h2 className="text-[9px] font-bold uppercase text-muted mb-3 tracking-widest border-b border-[#2e3147] pb-1">Daily Logic</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { r: "Фруктовий ліміт", d: "Максимум 1-2 порції на день, суворо до 12:00." },
                  { r: "Fiber-якор", d: "Мінімум 2-5г клітковини у кожному прийомі, крім передтрену." },
                  { r: "Жири та соуси", d: "Додаються тільки в готові страви — не більше 1 ч.л." },
                  { r: "Fast-Food Rule", d: "Дозволено 1-2 рази на тиждень замість вечері (вибирати білкові опції)." }
                ].map((item) => (
                  <li key={item.r} className="flex flex-col gap-0.5">
                    <div className="text-[10px] font-bold text-text flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#43d98c] shrink-0" /> {item.r}
                    </div>
                    <div className="text-[9px] text-muted pl-3 leading-tight">{item.d}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* База страв */}
        <CollapsibleSection title="База страв" emoji="🍽️" titleClass="text-[#e8eaf0]" className="pt-4 border-t border-[#2e3147]">
          <div className="space-y-8 pt-2">
            {mealCategories.map((category) => (
              <div key={category.title}>
                <h3 className={`text-[9px] font-bold uppercase tracking-widest mb-4 ${category.color}`}>
                  {category.title}
                </h3>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${category.variants.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
                  {category.variants.map((v, idx) => (
                    <div key={idx} className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-4 flex flex-col gap-3 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{v.icon}</span>
                        <span className="text-[8px] font-mono text-muted uppercase">V{idx + 1}</span>
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="text-[10px] font-bold text-text uppercase tracking-tight mb-1">{v.name}</div>
                        <ul className="space-y-1">
                          {v.products.map((p, pIdx) => (
                            <li key={pIdx} className="text-[10px] text-muted leading-tight flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-white/20 mt-1.5 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Fast Food */}
            <CollapsibleSection
              title="Fast Food (1 раз / тиждень замість вечері)"
              emoji="🍔"
              titleClass="text-[#f7a948]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {fastFoodOptions.map((cat, idx) => (
                  <div key={idx} className="bg-[#1a1d27] border border-[#f7a948]/20 rounded-xl p-4 flex flex-col gap-3 hover:border-[#f7a948]/40 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-[10px] font-bold text-text uppercase tracking-tight">{cat.name}</span>
                      </div>
                      <span className="text-[7px] font-mono text-[#f7a948]/60 bg-[#f7a948]/10 px-1.5 py-0.5 rounded">{cat.place}</span>
                    </div>
                    <div className="flex flex-col gap-3 pt-1 border-t border-[#2e3147]">
                      {cat.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            {item.who === "you" && <span className="text-[7px] font-bold text-[#6c63ff] bg-[#6c63ff]/10 px-1 py-0.5 rounded leading-none">Я</span>}
                            {item.who === "her" && <span className="text-[7px] font-bold text-[#ff6584] bg-[#ff6584]/10 px-1 py-0.5 rounded leading-none">Вона</span>}
                            <span className="text-[10px] font-semibold text-text">{item.name}</span>
                          </div>
                          <ul className="flex flex-col gap-0.5 pl-1">
                            {item.ing.map((ing, ingIdx) => (
                              <li key={ingIdx} className="text-[9px] text-muted leading-tight flex items-start gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#f7a948]/30 mt-1 shrink-0" />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Домашні основи */}
            <CollapsibleSection
              title="Домашні основи (лаваш / булочки / піца)"
              emoji="🧑‍🍳"
              titleClass="text-[#2dd4bf]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Лаваш */}
                <div className="bg-[#1a1d27] border border-[#2dd4bf]/20 rounded-xl p-4 flex flex-col gap-3 hover:border-[#2dd4bf]/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🫓</span>
                      <span className="text-[10px] font-bold text-text uppercase tracking-tight">Лаваш</span>
                    </div>
                    <span className="text-[7px] font-mono text-[#2dd4bf]/60 bg-[#2dd4bf]/10 px-1.5 py-0.5 rounded">як I Love Kebab</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-1 border-t border-[#2e3147]">
                    <div>
                      <div className="text-[8px] font-semibold text-[#2dd4bf] mb-1 uppercase tracking-widest">Склад</div>
                      <ul className="flex flex-col gap-0.5">
                        {[
                          { t: "ЦЗ борошно — 150 г", h: true },
                          { t: "Звичайне борошно — 150 г", h: false },
                          { t: "Вода гаряча — 170 мл", h: false },
                          { t: "Сіль — ½ ч.л.", h: false },
                          { t: "Олія оливкова — 2 ст.л.", h: true },
                          { t: "Насіння льону — 1 ст.л.", h: true },
                        ].map((item) => (
                          <li key={item.t} className="text-[9px] text-muted flex items-start gap-1">
                            <span className={`w-1 h-1 rounded-full mt-1 shrink-0 ${item.h ? "bg-[#43d98c]/60" : "bg-[#2dd4bf]/30"}`} />{item.t}
                            {item.h && <span className="text-[7px] text-[#43d98c] ml-0.5">↑</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[8px] font-semibold text-[#2dd4bf] mb-1 uppercase tracking-widest">Процес</div>
                      <ol className="flex flex-col gap-0.5">
                        {["Замісити, відпочинок 30 хв","Розкачати максимально тонко","Сковорідка суха, сильний вогонь","20–30 сек з кожного боку","Збризнути водою, накрити рушником"].map((s, i) => (
                          <li key={i} className="text-[9px] text-muted flex items-start gap-1">
                            <span className="text-[8px] font-mono text-[#2dd4bf]/50 shrink-0">{i+1}.</span>{s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Булочки */}
                <div className="bg-[#1a1d27] border border-[#2dd4bf]/20 rounded-xl p-4 flex flex-col gap-3 hover:border-[#2dd4bf]/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍞</span>
                      <span className="text-[10px] font-bold text-text uppercase tracking-tight">Булочки</span>
                    </div>
                    <span className="text-[7px] font-mono text-[#2dd4bf]/60 bg-[#2dd4bf]/10 px-1.5 py-0.5 rounded">як McDonald&apos;s</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-1 border-t border-[#2e3147]">
                    <div>
                      <div className="text-[8px] font-semibold text-[#2dd4bf] mb-1 uppercase tracking-widest">Склад</div>
                      <ul className="flex flex-col gap-0.5">
                        {[
                          { t: "ЦЗ борошно — 200 г", h: true },
                          { t: "Звичайне борошно — 300 г", h: false },
                          { t: "Молоко тепле — 250 мл", h: false },
                          { t: "Яйце — 1 шт", h: false },
                          { t: "Цукор — 1 ст.л.", h: false },
                          { t: "Дріжджі сухі — 7 г", h: false },
                          { t: "Олія оливкова — 3 ст.л.", h: true },
                          { t: "Сіль — 1 ч.л.", h: false },
                          { t: "Насіння льону в тісто — 1 ст.л.", h: true },
                          { t: "Кунжут — для посипки", h: false },
                        ].map((item) => (
                          <li key={item.t} className="text-[9px] text-muted flex items-start gap-1">
                            <span className={`w-1 h-1 rounded-full mt-1 shrink-0 ${item.h ? "bg-[#43d98c]/60" : "bg-[#2dd4bf]/30"}`} />{item.t}
                            {item.h && <span className="text-[7px] text-[#43d98c] ml-0.5">↑</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[8px] font-semibold text-[#2dd4bf] mb-1 uppercase tracking-widest">Процес</div>
                      <ol className="flex flex-col gap-0.5">
                        {["Активувати дріжджі в теплому молоці 10 хв","Замісити тісто, підйом 1 год","Сформувати булочки, підйом ще 30 хв","Змастити молоком + кунжут","200°C — 18 хв до золотистого кольору"].map((s, i) => (
                          <li key={i} className="text-[9px] text-muted flex items-start gap-1">
                            <span className="text-[8px] font-mono text-[#2dd4bf]/50 shrink-0">{i+1}.</span>{s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Піца */}
                <div className="bg-[#1a1d27] border border-[#2dd4bf]/20 rounded-xl p-4 flex flex-col gap-3 hover:border-[#2dd4bf]/40 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍕</span>
                      <span className="text-[10px] font-bold text-text uppercase tracking-tight">Основа для піци</span>
                    </div>
                    <span className="text-[7px] font-mono text-[#2dd4bf]/60 bg-[#2dd4bf]/10 px-1.5 py-0.5 rounded">як Маріо</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-1 border-t border-[#2e3147]">
                    <div>
                      <div className="text-[8px] font-semibold text-[#2dd4bf] mb-1 uppercase tracking-widest">Склад</div>
                      <ul className="flex flex-col gap-0.5">
                        {[
                          { t: "Борошно тип 00 — 350 г", h: false },
                          { t: "ЦЗ борошно — 150 г", h: true },
                          { t: "Вода — 310 мл", h: false },
                          { t: "Дріжджі сухі — 7 г", h: false },
                          { t: "Сіль — 2 ч.л.", h: false },
                          { t: "Цукор — 1 ч.л.", h: false },
                          { t: "Олія оливкова — 2 ст.л.", h: true },
                        ].map((item) => (
                          <li key={item.t} className="text-[9px] text-muted flex items-start gap-1">
                            <span className={`w-1 h-1 rounded-full mt-1 shrink-0 ${item.h ? "bg-[#43d98c]/60" : "bg-[#2dd4bf]/30"}`} />{item.t}
                            {item.h && <span className="text-[7px] text-[#43d98c] ml-0.5">↑</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[8px] font-semibold text-[#2dd4bf] mb-1 uppercase tracking-widest">Процес</div>
                      <ol className="flex flex-col gap-0.5">
                        {["Замісити, холодна ферментація 12–24 год","Дістати за 1 год до формування","Розтягувати руками, не качалкою","Соус → начинка → сир зверху","250°C (макс. духовка) — 10–12 хв"].map((s, i) => (
                          <li key={i} className="text-[9px] text-muted flex items-start gap-1">
                            <span className="text-[8px] font-mono text-[#2dd4bf]/50 shrink-0">{i+1}.</span>{s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

              </div>
            </CollapsibleSection>

            {/* Маринади та соуси */}
            <CollapsibleSection
              title="Маринади та соуси"
              emoji="🧂"
              titleClass="text-[#a78bfa]"
            >
              <div className="space-y-5">
                <div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-[#a78bfa] mb-3 flex items-center gap-1.5">
                    <span>🧂</span> Маринади — до приготування / заморозки
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {marinades.map((m) => (
                      <div key={m.name} className="bg-[#1a1d27] border border-[#a78bfa]/20 rounded-xl p-3 flex flex-col gap-2 hover:border-[#a78bfa]/40 transition-colors">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-bold text-text leading-tight">{m.name}</span>
                          <span className="text-[8px] text-[#43d98c]/60 shrink-0">❄️</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {m.used.map((u) => (
                            <span key={u} className="text-[7px] font-mono text-[#a78bfa] bg-[#a78bfa]/10 px-1 py-0.5 rounded">{u}</span>
                          ))}
                        </div>
                        <ul className="flex flex-col gap-0.5">
                          {m.ing.map((ingItem, idx) => (
                            <li key={idx} className="text-[9px] text-muted flex items-start gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#a78bfa]/30 mt-1 shrink-0" />{ingItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[8px] font-bold uppercase tracking-widest text-[#4fa3e0] mb-3 flex items-center gap-1.5">
                    <span>🥣</span> Соуси — до готової страви
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {sauces.map((sc) => (
                      <div key={sc.name} className="bg-[#1a1d27] border border-[#4fa3e0]/20 rounded-xl p-3 flex flex-col gap-2 hover:border-[#4fa3e0]/40 transition-colors">
                        <span className="text-[10px] font-bold text-text">{sc.name}</span>
                        <div className="flex flex-wrap gap-1">
                          {sc.used.map((u) => (
                            <span key={u} className="text-[7px] font-mono text-[#4fa3e0] bg-[#4fa3e0]/10 px-1 py-0.5 rounded">{u}</span>
                          ))}
                        </div>
                        <ul className="flex flex-col gap-0.5">
                          {sc.ing.map((ingItem, idx) => (
                            <li key={idx} className="text-[9px] text-muted flex items-start gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#4fa3e0]/30 mt-1 shrink-0" />{ingItem}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

          </div>
        </CollapsibleSection>

        {/* Тижневий розклад */}
        <WeeklySchedule />

        {/* Список покупок */}
        <CollapsibleSection title="Список покупок на тиждень" emoji="🛒">
          <ShoppingList />
        </CollapsibleSection>

      </div>
    </div>
  );
}
