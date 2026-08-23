import { ClipboardList, Flame, Apple, CalendarClock, ListOrdered } from "lucide-react";
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
    // Лише Сет1 (шашлики) і Сет6 (начинка булочок — спеції, без маринаду) справді
    // готуються в межах великого мілпрепу. Сет4/Сет5 тепер на свіжому курячому
    // філе, що готується того ж дня — див. окремі флет-рядки нижче.
    computedQty: {
      food: "chickenMarinated",
      sets: [{ set: "set1" }, { set: "set6" }],
      wastePercent: 5,
    },
  },
  {
    food: "chickenHearts",
    computedQty: { food: "chickenHearts", sets: [{ set: "set2" }], wastePercent: 15 },
  },
  {
    food: "porkTenderloin",
    computedQty: { food: "porkTenderloin", sets: [{ set: "set7" }], wastePercent: 5 },
  },
  { food: "mackerel", computedQty: { food: "mackerel", sets: [{ set: "set3", day: 1 }] } },
  { food: "cottageCheese", qualifier: "5–9%", qty: "500 г, для сирників" },
  {
    food: "eggs",
    qualifier: "для сирників",
    computedQty: { food: "eggs", sets: [], grams: 60, unit: "piece" },
  },
  { food: "chickenMarinated", qualifier: "сира, для Buffalo Pockets — Сет5", qty: "1135 г" },
  { food: "cottageCheese", qualifier: "для буффало-дипу", qty: "340 г" },
  {
    food: "chickenMarinated",
    qualifier: "свіжа, НЕ з мілпрепу — Сет4 (купувати окремо щотижня)",
    qty: "~300 г",
  },
  {
    food: "chickenMarinated",
    qualifier: "свіжа, НЕ з мілпрепу — Сет5 (хрустка курка, купувати окремо щотижня)",
    qty: "~280 г",
  },
];

const buffaloPocketIngredients: RecipeIngredient[] = [
  { food: "flour", qty: "500 г" },
  { food: "yogurtGreek", qualifier: "0% жиру, для тіста", qty: "520 г" },
  { food: "onion", qty: "160 г" },
  { food: "tomato", qty: "64 г" },
  { food: "mozzarella", qty: "350 г" },
  { food: "ketchup", qualifier: "для соус-міксу", qty: "240 г (у начинку) + 80 г (у дип)" },
  { food: "adjika", qualifier: "для соус-міксу", qty: "120 г (у начинку) + 40 г (у дип)" },
  { food: "milk", qualifier: "для дипу", qty: "60 мл" },
  { food: "garlic", qualifier: "порошок" },
  { food: "provencalHerbs", qualifier: "італійська суміш" },
  { food: "salt" },
];

const doughIngredients: RecipeIngredient[] = [
  { food: "flour", qty: "500 г" },
  { food: "milk", qty: "270 мл (250 мл в тісто + 20 мл змазати)" },
  { food: "yeast", qty: "7 г" },
  { food: "honey", qty: "15 г" },
  { food: "oil", qualifier: "рослинна", qty: "40 мл" },
  { food: "eggs", qualifier: "для тіста", qty: "1 шт" },
  { food: "salt" },
  { food: "hardCheese", qualifier: "для скоринки булочок", qty: "40 г" },
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
      food: "porkTenderloin",
      qualifier: "Сет7",
      computedQty: { food: "porkTenderloin", sets: [{ set: "set7" }] },
      marinade: "Часник, кумін, паприка, лайм",
    },
    {
      food: "mackerel",
      qualifier: "Сет3, день 1",
      computedQty: { food: "mackerel", sets: [{ set: "set3", day: 1 }] },
      marinade: "Скумбрія з лимоном",
    },
    {
      food: "chickenMarinated",
      qualifier: "начинка для булочок — Сет2 + Сет6",
      computedQty: {
        food: "chickenMarinated",
        sets: [{ set: "set2" }, { set: "set6" }],
      },
      marinade: "Спеції, без маринаду",
    },
    {
      food: "chickenMarinated",
      qualifier: "кальцоне (подрібнене) — Сет7",
      computedQty: { food: "chickenMarinated", sets: [{ set: "set7" }] },
      marinade: "Спеції, без маринаду",
    },
  ];

  const shashlikQty = formatGrams(
    sumMacroGramsForSetsMulti(["chickenMarinated"], [{ set: "set1" }], undefined, seasonOverride),
  );
  const heartsQty = formatGrams(
    sumMacroGramsForSetsMulti(["chickenHearts"], [{ set: "set2" }], undefined, seasonOverride),
  );
  const porkQty = formatGrams(
    sumMacroGramsForSetsMulti(["porkTenderloin"], [{ set: "set7" }], undefined, seasonOverride),
  );
  const bunFillingQty = formatGrams(
    sumMacroGramsForSetsMulti(
      ["chickenMarinated"],
      [{ set: "set2" }, { set: "set6" }],
      undefined,
      seasonOverride,
    ),
  );
  const calzoneChickenQty = formatGrams(
    sumMacroGramsForSetsMulti(["chickenMarinated"], [{ set: "set7" }], undefined, seasonOverride),
  );
  const calzoneCottageCheeseQty = formatGrams(
    sumMacroGramsForSetsMulti(["cottageCheese"], [{ set: "set7" }], undefined, seasonOverride),
  );
  const calzoneHardCheeseQty = formatGrams(
    sumMacroGramsForSetsMulti(["hardCheese"], [{ set: "set7" }], undefined, seasonOverride),
  );

  const algorithm = [
    {
      title: "Блок 1 — Маринування (~20 хв)",
      steps: [
        "Дістати все м'ясо з холодильника, розкласти на робочій поверхні. Підготувати 2 глибокі миски для маринування.",
        `Очищення: курячі серця (${heartsQty}) промити у друшляку, натискаючи пальцями для видалення згустків крові.`,
        `Нарізка: свинячу вирізку (${porkQty}) нарізати дрібними кубиками для боулів.`,
        `Нарізка: куряче філе для шашликів (${shashlikQty}) нарізати порційними шматочками розміром 2–3 см.`,
        `Миска 1: приготувати «Йогуртово-лимонний маринад» (рецепт нижче), додати куряче філе для шашликів (${shashlikQty}) та перемішати.`,
        `Миска 2: приготувати «Соєво-томатний маринад» (рецепт нижче), додати очищені курячі серця (${heartsQty}) та перемішати.`,
        `Без миски: приготувати «Спеції для вирізки» (рецепт нижче), обваляти в них кубики вирізки (${porkQty}).`,
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
      title: "Блок 3 — Булочки для Сету2/Сету6 (~25 хв активно + ~1.5 год розстоювання)",
      steps: [
        "Тісто: змішати тепле молоко (250 мл), дріжджі (7 г) і мед (15 г), дати постояти 5–10 хв до пінки. Додати олію (40 мл), яйце (1 шт), борошно (500 г) і сіль (8 г). Замісити 10–12 хв до однорідного тіста, накрити й дати підійти ~1 год.",
        "Поділити тісто на 16 частин, сформувати кульки, викласти на деко з відстанню. Змазати молоком (20 мл), присипати твердим сиром (40 г), зробити декоративні надрізи. Дати підійти ще 30 хв.",
        "Випікати при 200°C 8–12 хв до золотистої скоринки. Повністю охолодити на решітці (гаряче в морозилку не класти — псує текстуру), потім flash-freeze: розкласти нещільно на дошці, заморозити, скласти в пакет.",
        `Начинка: обсмажити куряче філе (${bunFillingQty}) на пательні з мінімумом олії (~1 ст.л. на всю партію) зі спеціями (паприка, часник і цибуля порошком, кайєнський перець, куркума). Цибулю, маринований огірок, аджику й салат НЕ додавати зараз — вони заморозку не переживають, докидаються свіжими під час збирання щоразу.`,
        "Охолодити начинку, розкласти по контейнерах порційно і заморозити окремо від булочок.",
      ],
    },
    {
      title: "Блок 4 — Курячий кальцоне для Сету7 (~35 хв, переважно пасивно)",
      steps: [
        `Подрібнити куряче філе (${calzoneChickenQty}) блендером або м'ясорубкою до фаршу, посолити й поперчити.`,
        "Викласти фарш пластом на деко, застелене пергаментом (форма прямокутника, ~1 см завтовшки).",
        `На одну половину викласти начинку: творог (${calzoneCottageCheeseQty}, попередньо розім'ятий виделкою), нарізаний помідор і твердий сир (${calzoneHardCheeseQty}) — Віталію без сиру, лише творог і помідор (менше жиру).`,
        "Накрити другою половиною пласта, защипнути краї як кальцоне. Запікати при 200°C ~25 хв до готовності курки всередині.",
        "Повністю охолодити (гарячим у морозилку не класти), щільно загорнути у фольгу порційно і відправити в морозильну камеру.",
      ],
    },
    {
      title: "Блок 5 — Buffalo Chicken Pockets для Сету5 (~40 хв, 10 шт)",
      steps: [
        "Соус-мікс (замість імпортного буффало-соусу): змішати кетчуп (320 г) з аджикою (160 г) та часниковим порошком — вийде ~480 г, вистачить і на начинку, і на дип.",
        "Тісто: розім'яти борошно (500 г) з грецьким йогуртом 0% (520 г), часниковим порошком, італійськими травами та сіллю до однорідного тіста.",
        "Начинка: сиру курку (1135 г, нарізану дрібно) змішати з цибулею (160 г, дрібно нарізаною), помідором (64 г, дрібно нарізаним), моцарелою (350 г) та частиною соус-міксу (240 г).",
        "Розкачати тісто, розкласти начинку по 10 порціях, защипнути краї у формі кишеньки (hot pocket). Викласти на деко, застелене пергаментом.",
        "Випікати при 190°C ~25–30 хв до готовності курки всередині та золотистої скоринки.",
        "Дип: збити блендером творог (340 г) з рештою соус-міксу (240 г) та молоком (60 мл) до кремової текстури.",
        "Повністю охолодити покети (гарячим у морозилку не класти), загорнути порційно у фольгу, дип розкласти по контейнерах — обидва в морозильну камеру.",
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
        title: "Спеції для вирізки",
        for: "Для свинячої вирізки боула (Сет7).",
        ingredients: [
          { food: "salt" },
          { food: "blackPepper" },
          { food: "garlic", qty: "2 зубчики (тиском) або сухий" },
          { food: "cumin", qty: "½ ч.л. (зіра)" },
          { food: "paprika", qty: "1 ч.л. (копчена)" },
        ],
        note: "Нарізану вирізку перемішати зі спеціями, обсмажити на сковороді з мінімумом олії.",
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

  const twoDayAlgorithm = [
    {
      title: "1. Раз на 14 днів — мілпреп сировини",
      steps: [
        "У неділю маринується/готується сировина про запас одразу на всі 7 сетів: м'ясо в маринаді, тісто, фарш, соус-заготовки — і замороджується порційно.",
        "У мілпреп НЕ входить готова страва цілком — гарнір (крупа, картопля) і салат заморозку не переживають і в нього не потрапляють. Виняток — маффіни Сету3: у них своя окрема коротка заготовка на весь сет (спікаються заздалегідь, зберігаються в холодильнику 2 дні, не в морозилці) — див. prepSteps самого Сету3, до спільного мілпрепу вона не входить.",
      ],
    },
    {
      title: "2. День 1 сета — готуємо одразу на 2 дні",
      steps: [
        "Ввечері напередодні — дістати з морозилки потрібну порцію м'яса (див. «Підготовка на завтра»).",
        "М'ясо і гарнір (крупа/картопля) готуються одразу ПОДВІЙНОЮ порцією — на сьогодні і про запас на завтра. Салат/свіжі овочі — лише в одинарній, сьогоднішній порції.",
        "Половину готового м'яса й гарніру (завтрашню) швидко охолодити в неглибокому контейнері (шар ≤5 см, щоб охололо за ~1 год, критично для рису й гречки) і одразу в холодильник — «поклав і забув» до завтра.",
        "Решту подати сьогодні на обід; на вечерю те саме м'ясо й гарнір лише розігріваються, а салат нарізається заново, свіжим.",
      ],
    },
    {
      title: "3. День 2 сета — розігрів + новий салат",
      steps: [
        "М'ясо й гарнір НЕ готуються заново — це вчорашня охолоджена порція з холодильника, просто розігріти наскрізь до 74°C (духовка/пательня/аерогриль повертають хрустким стравам текстуру краще за мікрохвильовку).",
        "Салат — завжди новий, з нуля, зі свіжих овочів, за тим самим рецептом що й учора. Це стосується і обіду, і вечері дня 2.",
        "Виняток — Сет 3: день 1 і день 2 це дві різні страви (запечена скумбрія → тунцевий салат), кожна своя, без розігріву однієї в іншу. Виняток — Сет 6 (паста з креветками): свіжого салату там немає, і на день 2 просто розігрівається вся страва цілком.",
      ],
    },
    {
      title: "4. Безпечне зберігання (USDA FSIS)",
      steps: [
        "Охолоджувати гарячу їжу до холодильника не довше ~2 год (для рису — ~1 год, через Bacillus cereus: токсин, який може утворитись при повільному охолодженні, не руйнується подальшим нагріванням).",
        "Зберігати в холодильнику при ≤4°C; в межах 3–4 днів навіть 1 доба (наш випадок) — з великим запасом.",
        "Розігрівати до 74°C (165°F) наскрізь, а не просто «тепле».",
      ],
    },
    {
      title: "5. Раз на тиждень — другий шопінг-трип (середа)",
      steps: [
        "Довозяться свіжі овочі й зелень для салатів сетів другої половини тижня, щоб жоден овоч не лежав у холодильнику довше ~3–4 днів до готування.",
      ],
    },
  ];

  const dayTemplate = [
    {
      title: "Передтрен (снек)",
      text: "Банан — фіксовано, не залежить від сета.",
    },
    {
      title: "Сніданок",
      text: "Білок (яйця / сирники / маффіни) + вуглевод (бутерброд, хліб) + фрукт-десерт. Фрукт ротується по сетах за принципом «чим швидше сет їдять після закупівлі — тим менш стійкий до зберігання фрукт можна ставити»: Сет1 персик, Сет2 слива, Сет3 абрикос, Сет4 груша, Сет5 яблуко, Сет6 апельсин, Сет7 яблуко.",
    },
    {
      title: "Обід",
      text: "Білок активного сета + гарнір (крупа/картопля) + свіжий сезонний салат/овочі + соус. У день 1 сета м'ясо й гарнір готуються одразу подвійною порцією (сьогодні + завтра про запас), салат — лише сьогоднішня порція. У день 2 м'ясо й гарнір тільки розігріваються з учора, а салат готується заново, свіжим.",
    },
    {
      title: "Вечеря",
      text: "Та сама страва, що на обід цього дня: м'ясо й гарнір розігріваються, салат нарізається заново — свіжим, як і на обіді.",
    },
    {
      title: "Перекус",
      text: "Протеїновий йогуртовий пудинг: йогурт + протеїн + ягоди/фрукт, без варки — фіксований шаблон незалежно від сета.",
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
              Раз на 14 днів (у неділю) здійснюється закупка і підготовка (маринування) білкових
              продуктів на весь цикл із 7 сетів — заморожується лише сировина. Гарнір і салат
              мілпреп не зачіпає: вони готуються свіжими щоразу, див. алгоритм нижче.
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
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
            <span className="text-label block mb-2">Тісто для булочок</span>
            <ul className="flex flex-col gap-1.5">
              {doughIngredients.map((ing, idx) => (
                <li key={idx} className={ingredientItemClass}>
                  <span className="text-zinc-600">·</span>
                  <span>{ingredientLabel(ing, seasonOverride)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-label block mb-2">Buffalo Chicken Pockets</span>
            <ul className="flex flex-col gap-1.5">
              {buffaloPocketIngredients.map((ing, idx) => (
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
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <CalendarClock size={16} />
          </div>
          <div>
            <h3 className="text-panel-title">Алгоритм: сет → 2 дні</h3>
            <p className="text-caption">Що саме готується раз на 14 днів, а що — заново щодня</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {twoDayAlgorithm.map((block, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-accent-nutrition">{block.title}</span>
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
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <ListOrdered size={16} />
          </div>
          <div>
            <h3 className="text-panel-title">Алгоритм формування дня</h3>
            <p className="text-caption">Однаковий шаблон прийомів їжі для всіх 7 сетів</p>
          </div>
        </div>
        <ol className="flex flex-col gap-2">
          {dayTemplate.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="font-mono text-xs text-zinc-500 shrink-0">{idx + 1}.</span>
              <span>
                <span className="font-semibold text-zinc-200">{item.title}</span> —{" "}
                {highlightProductMentions(item.text)}
              </span>
            </li>
          ))}
        </ol>
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
