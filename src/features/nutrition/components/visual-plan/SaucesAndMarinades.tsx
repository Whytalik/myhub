import React from "react";

const MARINADES = [
  { name: "Соєво-часниковий", comp: "2 ст.л. соєвого соусу + 2 зубці часнику + 1 ч.л. паприки", target: "Курка на сковорідці" },
  { name: "Лимонно-трав'яний", comp: "сік 1/2 лимона + орегано + чорний перець + 1 ч.л. олії", target: "Курка/риба в духовці" },
  { name: "Йогуртово-каррі", comp: "2 ст.л. йогурту + 1 ч.л. каррі + щіпка куркуми", target: "Курка в духовці (overnight)" },
  { name: "Гірчично-медовий", comp: "1 ч.л. діжонської гірчиці + 1 ч.л. меду + 1 ч.л. олії", target: "Риба / куряче філе" },
  { name: "Пряний томатний", comp: "1 ст.л. томатної пасти + часник + орегано + щіпка чилі", target: "Яловичина / курка" },
];

const SAUCES = [
  { name: "Лимонно-оливковий", comp: "1 ч.л. олії + сік 1/4 лимона + сіль + перець", kcal: "+40" },
  { name: "Йогурт з кропом", comp: "2 ст.л. йогурту + кріп + 1 зубець часнику", kcal: "+25" },
  { name: "Гірчично-медовий", comp: "1 ч.л. олії + 1/2 ч.л. гірчиці + 1/2 ч.л. меду", kcal: "+50" },
  { name: "Тахіні-лимонний", comp: "1 ч.л. тахіні + сік 1/4 лимона + 1 ст.л. води", kcal: "+45" },
];

export const SaucesAndMarinades = () => {
  return (
    <section className="space-y-8">
      {/* Marinades */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
          <span className="text-base">🧂</span> Маринади для м&apos;яса/риби
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MARINADES.map((m, idx) => (
            <div key={idx} className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-4">
              <div className="font-bold text-body text-[#e8eaf0] mb-1">{m.name}</div>
              <div className="text-xs text-[#7b80a0] leading-normal mb-2">{m.comp}</div>
              <div className="text-note text-[#f7a948] italic">→ {m.target}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Salad Sauces */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#7b80a0] mb-4 flex items-center gap-2">
          <span className="text-base">🥗</span> Соуси для салатів та боулів
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAUCES.map((s, idx) => (
            <div key={idx} className="bg-[#1a1d27] border border-[#2e3147] rounded-xl p-4">
              <div className="font-bold text-body text-[#e8eaf0] mb-1">{s.name}</div>
              <div className="text-xs text-[#7b80a0] leading-normal mb-2">{s.comp}</div>
              <div className="text-note text-[#43d98c]">{s.kcal}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
