export const Favorites = () => {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
        <span className="text-base">🍔</span> Фаворити (Burgers & Kebab)
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BURGERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-5 border-t-4 border-t-[#6c63ff]">
            <div className="text-body font-semibold uppercase tracking-wide text-[#6c63ff] mb-1">
              Бургер (Ви)
            </div>
            <div className="text-xs text-[#7b80a0] mb-4">
              Яловичина + ЦЗ Булка
            </div>
            <ul className="space-y-1 text-xs mb-4">
              <li className="flex justify-between">
                <span>Яловичина (ранок)</span>
                <span className="text-[#6c63ff]">180г</span>
              </li>
              <li className="flex justify-between">
                <span>Домашня ЦЗ булка</span>
                <span className="text-[#6c63ff]">1 шт</span>
              </li>
              <li className="flex justify-between">
                <span>Гірчиця / Йогурт</span>
                <span className="text-[#6c63ff]">20г</span>
              </li>
            </ul>
            <div className="bg-[#6c63ff26] text-[#6c63ff] rounded inline-block px-2 py-1 text-xs font-bold">
              ~480 ккал
            </div>
          </div>

          <div className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-5 border-t-4 border-t-[#ff6584]">
            <div className="text-body font-semibold uppercase tracking-wide text-[#ff6584] mb-1">
              Бургер (Вона)
            </div>
            <div className="text-xs text-[#7b80a0] mb-4">
              Яловичина + Сир Чеддер
            </div>
            <ul className="space-y-1 text-xs mb-4">
              <li className="flex justify-between">
                <span>Яловичина (ранок)</span>
                <span className="text-[#ff6584]">150г</span>
              </li>
              <li className="flex justify-between">
                <span>Домашня булка</span>
                <span className="text-[#ff6584]">1 шт</span>
              </li>
              <li className="flex justify-between">
                <span>Сир Чеддер</span>
                <span className="text-[#ff6584]">1 скибка</span>
              </li>
            </ul>
            <div className="bg-[#ff658426] text-[#ff6584] rounded inline-block px-2 py-1 text-xs font-bold">
              ~650 ккал
            </div>
          </div>
        </div>

        {/* KEBAB */}
        <div className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-5 border-t-4 border-t-[#43d98c]">
          <div className="text-body font-semibold uppercase tracking-wide text-[#43d98c] mb-1">
            I Love Kebab Style Shawarma
          </div>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <ul className="space-y-1 text-xs">
              <div className="text-caption uppercase text-[#7b80a0] mb-1 tracking-tighter">
                Основа (на 1 шт)
              </div>
              <li className="flex justify-between border-b border-[#2e3147]/30 pb-1">
                <span>Лаваш тонкий</span>
                <span className="text-[#43d98c]">1 шт</span>
              </li>
              <li className="flex justify-between border-b border-[#2e3147]/30 pb-1">
                <span>Курка (ранкова)</span>
                <span className="text-[#43d98c]">150г</span>
              </li>
              <li className="flex justify-between border-b border-[#2e3147]/30 pb-1">
                <span>Овочевий мікс</span>
                <span className="text-[#43d98c]">100г</span>
              </li>
            </ul>
            <ul className="space-y-1 text-xs">
              <div className="text-caption uppercase text-[#7b80a0] mb-1 tracking-tighter">
                Фірмові соуси
              </div>
              <li className="text-[#e8eaf0]">White: Йогурт + Тахіні</li>
              <li className="text-[#e8eaf0]">Red: Томатна паста + Чилі</li>
              <div className="flex flex-col gap-1 mt-3">
                <span className="text-caption font-bold text-[#6c63ff]">
                  Ви: ~520 ккал
                </span>
                <span className="text-caption font-bold text-[#ff6584]">
                  Вона: ~680 ккал
                </span>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
