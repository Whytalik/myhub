"use client";

import React, { useState, useMemo } from "react";

interface ShoppingItem {
  name: string;
  qty: string;
  price: number;
}

interface ShoppingCategory {
  category: string;
  icon: string;
  items: ShoppingItem[];
}

const SHOPPING_DATA: ShoppingCategory[] = [
  {
    category: "М'ясо/Риба",
    icon: "🥩",
    items: [
      { name: "Куряче філе", qty: "2.5 кг", price: 450 },
      { name: "Яловичина", qty: "1.5 кг", price: 420 },
      { name: "Тунець (185г)", qty: "3 банки", price: 150 },
    ],
  },
  {
    category: "Овочі/Фрукти",
    icon: "🥦",
    items: [
      { name: "Помідори", qty: "2.5 кг", price: 450 },
      { name: "Банани", qty: "3 кг", price: 220 },
      { name: "Картопля", qty: "4 кг", price: 80 },
      { name: "Морква", qty: "500г", price: 20 },
      { name: "Овочі (мікс, салат, броколі)", qty: "3 кг", price: 300 },
      { name: "Ягоди сезонні", qty: "600г", price: 120 },
      { name: "Авокадо", qty: "4 шт", price: 160 },
    ],
  },
  {
    category: "Молочне/Яйця",
    icon: "🥚",
    items: [
      { name: "Яйця (С1)", qty: "4 дес.", price: 280 },
      { name: "Йогурт грецький", qty: "2 кг", price: 320 },
      { name: "Сир кисломолочний", qty: "2 кг", price: 300 },
      { name: "Сир Твердий/Фета", qty: "500г", price: 180 },
    ],
  },
  {
    category: "Бакалія/Інше",
    icon: "🫙",
    items: [
      { name: "Батон нарізний", qty: "2 шт", price: 40 },
      { name: "Рисові хлібці", qty: "1 уп.", price: 55 },
      { name: "Гречка", qty: "1 уп.", price: 45 },
      { name: "Рис", qty: "1 уп.", price: 40 },
      { name: "Макарони тв. сорт", qty: "1 уп.", price: 45 },
      { name: "Сочевиця", qty: "1 уп.", price: 50 },
      { name: "Квасоля суха", qty: "1 уп.", price: 40 },
      { name: "Чай", qty: "1 уп.", price: 35 },
      { name: "Мед", qty: "1 банка", price: 0 },
      { name: "Олія соняшникова", qty: "1 л", price: 55 },
      { name: "Спеції / Соєвий соус", qty: "Набір", price: 45 },
    ],
  },
];

export const ShoppingList = () => {
  const [useJam, setUseJam] = useState(false);

  const processedData = useMemo(() => {
    return SHOPPING_DATA.map((cat) => {
      if (cat.category === "Бакалія/Інше") {
        const items = cat.items.map((item) => {
          if (item.name === "Мед" && useJam) {
            return { ...item, name: "Варення без цукру", qty: "1 банка", price: 0 };
          }
          return item;
        });
        return { ...cat, items };
      }
      return cat;
    });
  }, [useJam]);

  const total = useMemo(() => {
    return processedData.reduce((sum, cat) => {
      return sum + cat.items.reduce((s, item) => s + item.price, 0);
    }, 0);
  }, [processedData]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] flex items-center gap-2">
          <span className="text-base">🛒</span> Список покупок
        </h2>
        <button
          onClick={() => setUseJam((v) => !v)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-caption font-semibold transition-all border ${
            useJam
              ? "bg-[#43d98c26] text-[#43d98c] border-[#43d98c40]"
              : "bg-[#222535] text-[#7b80a0] border-[#2e3147] hover:text-[#e8eaf0]"
          }`}
        >
          <span>{useJam ? "🍓 Варення без цукру" : "🍯 Мед"}</span>
          <span className="text-[#7b80a0] opacity-60">↔</span>
          <span>{useJam ? "🍯 Мед" : "🍓 Варення без цукру"}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {processedData.map((cat) => {
          const catTotal = cat.items.reduce((s, i) => s + i.price, 0);
          return (
            <div key={cat.category} className="bg-[#1a1d27] border border-[#2e3147] rounded-xl overflow-hidden">
              <div className="p-3 bg-[#222535] font-bold text-xs border-b border-[#2e3147] flex justify-between">
                <span>{cat.icon} {cat.category}</span>
                <span className="text-[#7b80a0] font-normal">~{catTotal} ₴</span>
              </div>
              <div className="divide-y divide-[#2e3147]">
                {cat.items.map((item) => (
                  <div key={item.name} className="p-3 flex justify-between text-xs items-center">
                    <div>
                      <span>{item.name}</span>
                      <span className="block text-caption text-[#7b80a0]">{item.qty}</span>
                    </div>
                    <div className={`font-bold ${item.price > 0 ? "text-[#43d98c]" : "text-[#7b80a0]"}`}>
                      {item.price > 0 ? `~${item.price} ₴` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-gradient-to-br from-[#1a1d27] to-[#222535] border border-[#6c63ff] rounded-xl p-8 flex justify-between items-center">
        <div className="text-xs font-semibold">Загальний тижневий бюджет</div>
        <div className="text-base font-extrabold text-[#43d98c]">~{total} грн</div>
      </div>
    </section>
  );
};
