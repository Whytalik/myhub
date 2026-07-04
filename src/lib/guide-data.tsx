import {
  CheckCircle2,
  Zap,
  CalendarDays,
  Package,
  UtensilsCrossed,
  ClipboardList,
  ShoppingCart,
  LayoutDashboard,
  Moon,
  Heart,
  Apple,
  Sun,
  PenLine,
} from "lucide-react";
import type { SpaceKey } from "@/lib/spaces/spaces";

export interface GuideSection {
  id: string;
  label: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export interface SpaceGuide {
  title: string;
  description: string;
  sections: GuideSection[];
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 mb-6 last:mb-0">
      <h3 className="text-panel-title">{title}</h3>
      <div className="text-body">{children}</div>
    </div>
  );
}

function RatingTable({ rows }: { rows: { value: string; label: string; description: string }[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row) => (
        <div key={row.value} className="glass-card p-3 flex items-start gap-3">
          <span className="font-mono text-xs font-semibold text-accent shrink-0 w-10">
            {row.value}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-zinc-100">{row.label}</span>
            {row.description && <p className="text-caption">{row.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
          <span className="text-zinc-600 shrink-0">–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export const GUIDE_DATA: Partial<Record<SpaceKey, SpaceGuide>> = {
  life: {
    title: "Life Space Guide",
    description: "Reference for daily tracking, rating criteria, and workflow.",
    sections: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        content: (
          <div>
            <Block title="Що таке Life Space?">
              <p>
                Life Space — це щоденний операційний центр. Основна мета — відстежувати стан,
                виконувати рутини та рефлектувати для постійного росту.
              </p>
            </Block>
            <Block title="Щоденний workflow">
              <List
                items={[
                  "Ранок: заповни Sleep + Morning Routine + поставити задачі дня",
                  "Впродовж дня: відмічай звички, виконуй задачі",
                  "Вечір: Evening Routine + Energy/Mood + Reflection",
                ]}
              />
            </Block>
            <Block title="З чого починати (перший раз)">
              <List
                items={[
                  "Week — встанови типи днів на тиждень",
                  "Habits — додай 3-5 ключових звичок",
                  "Tasks — створи сфери (Spheres) для категоризації задач",
                  "Journal — почни заповнювати щодня",
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "journal-sleep",
        label: "Journal — Sleep",
        icon: Moon,
        content: (
          <div>
            <Block title="Поля">
              <List
                items={[
                  "Bedtime — час відходу до сну (коли ліг)",
                  "Wakeup — час підйому",
                  "Hours — розраховується автоматично або вводиш вручну",
                  "Quality — оцінка якості сну 1–10",
                  "Note — додаткові нотатки (снилося, причини поганого сну тощо)",
                ]}
              />
            </Block>
            <Block title="Критерії оцінки якості (Sleep Quality)">
              <RatingTable
                rows={[
                  {
                    value: "1–3",
                    label: "Погано",
                    description: "Майже не спав, часто прокидався, відчуваю себе розбитим",
                  },
                  {
                    value: "4–5",
                    label: "Задовільно",
                    description: "Спав, але неглибоко або мало годин, втома є",
                  },
                  {
                    value: "6–7",
                    label: "Нормально",
                    description: "Достатньо годин, відчуваю себе більш-менш бадьоро",
                  },
                  {
                    value: "8–9",
                    label: "Добре",
                    description: "Якісний сон, прокинувся сам або без важкості",
                  },
                  {
                    value: "10",
                    label: "Ідеально",
                    description: "Відпочив повністю, відчуваю себе 100%",
                  },
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "journal-energy",
        label: "Journal — Energy & Mood",
        icon: Heart,
        content: (
          <div>
            <Block title="Поля">
              <List
                items={[
                  "Energy (ранок) — рівень фізичної енергії вранці",
                  "Mood — емоційний стан на початку дня",
                  "Emotions — список конкретних емоцій (вибір з переліку)",
                  "Weight — вага (опціонально, якщо відстежуєш)",
                  "Energy Note — пояснення до рівня енергії",
                  "Evening Energy — рівень енергії увечері",
                ]}
              />
            </Block>
            <Block title="Критерії оцінки Energy (1–10)">
              <RatingTable
                rows={[
                  {
                    value: "1–2",
                    label: "Виснажений",
                    description: "Важко встати, все дається з великим зусиллям",
                  },
                  {
                    value: "3–4",
                    label: "Низька",
                    description: "Сонний, мало ресурсу, продуктивність мінімальна",
                  },
                  {
                    value: "5–6",
                    label: "Середня",
                    description: "Функціоную нормально, але без запасу",
                  },
                  {
                    value: "7–8",
                    label: "Висока",
                    description: "Є драйв, легко концентруюсь, хочеться діяти",
                  },
                  {
                    value: "9–10",
                    label: "Пікова",
                    description: "Максимальний ресурс, відчуваю силу та мотивацію",
                  },
                ]}
              />
            </Block>
            <Block title="Критерії оцінки Mood (1–10)">
              <RatingTable
                rows={[
                  {
                    value: "1–2",
                    label: "Дуже погано",
                    description: "Депресивний стан, тривога, апатія",
                  },
                  {
                    value: "3–4",
                    label: "Погано",
                    description: "Подразливість, смуток, незадоволення",
                  },
                  {
                    value: "5–6",
                    label: "Нейтрально",
                    description: "Ні добре ні погано, рівний стан",
                  },
                  {
                    value: "7–8",
                    label: "Добре",
                    description: "Позитивний настрій, спокій, задоволення",
                  },
                  {
                    value: "9–10",
                    label: "Відмінно",
                    description: "Радість, натхнення, внутрішній підйом",
                  },
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "journal-nutrition",
        label: "Journal — Nutrition",
        icon: Apple,
        content: (
          <div>
            <Block title="Поля">
              <List
                items={[
                  "Nutrition — загальна оцінка харчування за день (1–10)",
                  "Nutrition Note — що конкретно їв, відхилення від плану",
                ]}
              />
            </Block>
            <Block title="Критерії оцінки Nutrition (1–10)">
              <RatingTable
                rows={[
                  {
                    value: "1–3",
                    label: "Погано",
                    description: "Їв багато шкідливого, пропускав прийоми їжі, переїдав",
                  },
                  {
                    value: "4–5",
                    label: "Задовільно",
                    description: "Їв не за планом, але без серйозних порушень",
                  },
                  {
                    value: "6–7",
                    label: "Нормально",
                    description: "Більш-менш дотримувався плану, невеликі відхилення",
                  },
                  {
                    value: "8–9",
                    label: "Добре",
                    description: "Дотримався плану, всі прийоми їжі, норма КБЖУ",
                  },
                  {
                    value: "10",
                    label: "Ідеально",
                    description: "Повне дотримання плану, жодних відхилень",
                  },
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "journal-routines",
        label: "Journal — Routines",
        icon: Sun,
        content: (
          <div>
            <Block title="Morning & Evening Routine">
              <p>
                Рутини — це чеклісти фіксованих дій зранку та ввечері. Кожен пункт відмічається як
                виконаний або ні.
              </p>
            </Block>
            <Block title="Типи днів">
              <List
                items={[
                  "Training Day — тренувальний день, morning routine включає тренування",
                  "Rest Day — день відпочинку, полегшена рутина",
                  "Work Day — стандартний робочий день",
                ]}
              />
            </Block>
            <Block title="Routine Note">
              <p>Використовуй для нотаток про відхилення від рутини або особливі обставини дня.</p>
            </Block>
          </div>
        ),
      },
      {
        id: "journal-reflection",
        label: "Journal — Reflection",
        icon: PenLine,
        content: (
          <div>
            <Block title="Поля рефлексії">
              <List
                items={[
                  "Win Today — найкраща річ або досягнення дня",
                  "Improve Tomorrow — що зробиш по-іншому завтра",
                  "Gratitude — за що вдячний сьогодні",
                  "Brain Dump — будь-які думки, ідеї, що варто записати",
                ]}
              />
            </Block>
            <Block title="Standup (якщо є)">
              <List
                items={[
                  "Standup Done — чи провів стендап",
                  "Standup Plan — що планував зробити",
                  "Standup Blockers — що заважає або блокує",
                ]}
              />
            </Block>
            <Block title="Рекомендація">
              <p>
                Заповнюй рефлексію ввечері, не раніше 21:00. Win Today — конкретна дія або
                результат, не абстрактне &quot;добре попрацював&quot;.
              </p>
            </Block>
          </div>
        ),
      },
      {
        id: "tasks",
        label: "Tasks",
        icon: CheckCircle2,
        content: (
          <div>
            <Block title="Структура задач">
              <List
                items={[
                  "Сфери (Spheres) — верхній рівень категоризації (робота, особисте, здоров'я тощо)",
                  "Задачі — прив'язані до сфери та конкретної дати",
                  "Підзадачі — декомпозиція великих задач",
                ]}
              />
            </Block>
            <Block title="Workflow">
              <p>
                Заповнюй задачі на день зранку або ввечері напередодні. Плейсхолдер для детального
                опису.
              </p>
            </Block>
          </div>
        ),
      },
      {
        id: "habits",
        label: "Habits",
        icon: Zap,
        content: (
          <div>
            <Block title="Що таке Habits?">
              <p>
                Habits — щоденні звички які відмічаєш як виконані або ні. Будує стрік послідовності.
              </p>
            </Block>
            <Block title="Рекомендації">
              <List
                items={[
                  "Починай з 3-5 ключових звичок, не більше",
                  "Звичка має бути конкретна (не «бути здоровим», а «30 хвилин тренування»)",
                  "Плейсхолдер для детального опису критеріїв виконання",
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "week",
        label: "Week",
        icon: CalendarDays,
        content: (
          <div>
            <Block title="Що таке Week?">
              <p>
                Week — планування типів днів на тиждень наперед. Визначає який Morning Routine і які
                активності очікуються в кожен день.
              </p>
            </Block>
            <Block title="Типи днів">
              <p>Плейсхолдер — опиши тут які типи днів у тебе є і що кожен означає.</p>
            </Block>
          </div>
        ),
      },
    ],
  },

  nutrition: {
    title: "Nutrition Space Guide",
    description: "Reference for meal planning, macro tracking, and shopping workflow.",
    sections: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        content: (
          <div>
            <Block title="Що таке Nutrition Space?">
              <p>
                Nutrition Space — система планування харчування. Мета — прибрати щоденні рішення що
                їсти та мати контроль над макросами.
              </p>
            </Block>
            <Block title="Основний workflow">
              <List
                items={[
                  "1. Products — заповни базу продуктів з макросами",
                  "2. Dishes — створи страви зі своїх продуктів",
                  "3. Plans — сформуй денний або тижневий план харчування",
                  "4. Shopping — сформуй список покупок на основі плану",
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "products",
        label: "Products",
        icon: Package,
        content: (
          <div>
            <Block title="Що таке Products?">
              <p>
                Products — база всіх продуктів які ти їси, з макронутрієнтами на 100г або на
                одиницю.
              </p>
            </Block>
            <Block title="Що заповнювати">
              <List
                items={[
                  "Назва продукту",
                  "Калорії, білки, жири, вуглеводи (на 100г)",
                  "Одиниця виміру (г, мл, шт)",
                  "Стандартна порція",
                  "Плейсхолдер для інших полів",
                ]}
              />
            </Block>
            <Block title="Рекомендації">
              <p>Плейсхолдер — опиши тут свої критерії заповнення продуктів.</p>
            </Block>
          </div>
        ),
      },
      {
        id: "dishes",
        label: "Dishes",
        icon: UtensilsCrossed,
        content: (
          <div>
            <Block title="Що таке Dishes?">
              <p>
                Dishes — рецептарна база. Страва складається з продуктів з вказаними кількостями.
                Макроси рахуються автоматично.
              </p>
            </Block>
            <Block title="Як заповнювати">
              <List
                items={[
                  "Назва страви",
                  "Список інгредієнтів (з Products) + кількість кожного",
                  "Кількість порцій",
                  "Плейсхолдер для інших полів",
                ]}
              />
            </Block>
            <Block title="Рекомендації">
              <p>Плейсхолдер — опиши тут свій підхід до ведення рецептів.</p>
            </Block>
          </div>
        ),
      },
      {
        id: "plans",
        label: "Plan",
        icon: ClipboardList,
        content: (
          <div>
            <Block title="Що таке Plan?">
              <p>
                Plan — тижневий план харчування. Комбінуєш страви по прийомах їжі, система показує
                загальні макроси дня.
              </p>
            </Block>
            <Block title="Як заповнювати">
              <List
                items={[
                  "Обери тип дня (тренувальний/відпочинок) якщо є різниця в КБЖУ",
                  "Додай страви до кожного прийому їжі",
                  "Перевір що досягнуто цільові макроси",
                  "Плейсхолдер для інших деталей",
                ]}
              />
            </Block>
          </div>
        ),
      },
      {
        id: "shopping",
        label: "Shopping",
        icon: ShoppingCart,
        content: (
          <div>
            <Block title="Що таке Shopping?">
              <p>
                Shopping — автоматично генерований список покупок на основі активних планів. Агрегує
                всі потрібні продукти з кількостями.
              </p>
            </Block>
            <Block title="Workflow">
              <List
                items={[
                  "Активуй потрібні плани на тиждень",
                  "Перейди в Shopping — список сформується автоматично",
                  "Відмічай куплені продукти",
                  "Плейсхолдер для інших деталей",
                ]}
              />
            </Block>
          </div>
        ),
      },
    ],
  },
};
