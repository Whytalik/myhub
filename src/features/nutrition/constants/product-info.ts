export type Category = "fruits" | "bread" | "meat" | "dairy" | "veggies" | "grains" | "spices" | "drinks";

export type ProductInfo = {
  category: Category;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  price: string;
};

export const PRODUCT_INFO: Record<string, ProductInfo> = {
  // ── Фрукти ───────────────────────────────────────────────
  "Банан стиглий":       { category: "fruits",  kcal: 89,  protein: 1.1, fat: 0.3,  carbs: 23,   fiber: 2.6, price: "55–85 грн/кг"          },
  "Яблуко":              { category: "fruits",  kcal: 52,  protein: 0.3, fat: 0.2,  carbs: 14,   fiber: 2.4, price: "35–65 грн/кг"          },
  "Фінік":               { category: "fruits",  kcal: 277, protein: 1.8, fat: 0.2,  carbs: 75,   fiber: 6.7, price: "280–450 грн/кг"        },
  "Груша":               { category: "fruits",  kcal: 57,  protein: 0.4, fat: 0.1,  carbs: 15,   fiber: 3.1, price: "55–95 грн/кг"          },
  "Вишня замор.":        { category: "fruits",  kcal: 50,  protein: 1.0, fat: 0.3,  carbs: 12,   fiber: 1.6, price: "120–190 грн/кг"        },
  "Чорниця замор.":      { category: "fruits",  kcal: 57,  protein: 0.7, fat: 0.3,  carbs: 14,   fiber: 2.4, price: "180–300 грн/кг"        },
  "Ананас":              { category: "fruits",  kcal: 50,  protein: 0.5, fat: 0.1,  carbs: 13,   fiber: 1.4, price: "120–180 грн/шт"        },
  "Лимон":               { category: "fruits",  kcal: 34,  protein: 0.9, fat: 0.1,  carbs: 3,    fiber: 2.8, price: "85–140 грн/кг"         },

  // ── Хліб / Снеки ─────────────────────────────────────────
  "Рисові хлібці":       { category: "bread",   kcal: 387, protein: 8,   fat: 3,    carbs: 82,   fiber: 3.0, price: "65–100 грн/100г"       },
  "Батон":               { category: "bread",   kcal: 265, protein: 8,   fat: 3,    carbs: 53,   fiber: 2.3, price: "35–55 грн/шт"          },
  "ЦЗ Хліб":             { category: "bread",   kcal: 247, protein: 9,   fat: 3,    carbs: 48,   fiber: 7.0, price: "55–95 грн/буханка"     },
  "Лаваш тонкий":        { category: "bread",   kcal: 277, protein: 9,   fat: 1,    carbs: 57,   fiber: 2.4, price: "45–75 грн/шт"          },
  "Солона соломка":      { category: "bread",   kcal: 360, protein: 9,   fat: 4,    carbs: 72,   fiber: 2.1, price: "30–55 грн/уп"          },

  // ── М'ясо / Риба ─────────────────────────────────────────
  "Куряче філе":         { category: "meat",    kcal: 165, protein: 31,  fat: 3.6,  carbs: 0,    fiber: 0,   price: "170–230 грн/кг"        },
  "Куряче стегно":       { category: "meat",    kcal: 209, protein: 26,  fat: 11,   carbs: 0,    fiber: 0,   price: "100–145 грн/кг"        },
  "Курячі серця":        { category: "meat",    kcal: 153, protein: 16,  fat: 10,   carbs: 0,    fiber: 0,   price: "130–180 грн/кг"        },
  "Яловичий фарш":       { category: "meat",    kcal: 254, protein: 17,  fat: 20,   carbs: 0,    fiber: 0,   price: "280–380 грн/кг"        },
  "Яловичина":           { category: "meat",    kcal: 250, protein: 26,  fat: 15,   carbs: 0,    fiber: 0,   price: "320–450 грн/кг"        },
  "Тунець у вл. соку":   { category: "meat",    kcal: 116, protein: 26,  fat: 1,    carbs: 0,    fiber: 0,   price: "55–100 грн/185г"       },
  "Хек":                 { category: "meat",    kcal: 86,  protein: 16,  fat: 2,    carbs: 0,    fiber: 0,   price: "160–230 грн/кг"        },
  "Тилапія":             { category: "meat",    kcal: 96,  protein: 20,  fat: 2,    carbs: 0,    fiber: 0,   price: "180–250 грн/кг"        },
  "Мінтай":              { category: "meat",    kcal: 72,  protein: 16,  fat: 0.9,  carbs: 0,    fiber: 0,   price: "140–200 грн/кг"        },
  "Лосось / Форель":     { category: "meat",    kcal: 160, protein: 22,  fat: 8,    carbs: 0,    fiber: 0,   price: "480–700 грн/кг"        },
  "Бекон":               { category: "meat",    kcal: 541, protein: 12,  fat: 53,   carbs: 1.5,  fiber: 0,   price: "380–550 грн/кг"        },

  // ── Молочне / Яйця ───────────────────────────────────────
  "Сир кисломолочний":   { category: "dairy",   kcal: 98,  protein: 11,  fat: 4,    carbs: 3,    fiber: 0,   price: "50–85 грн/250г"        },
  "Яйця":                { category: "dairy",   kcal: 143, protein: 13,  fat: 10,   carbs: 1,    fiber: 0,   price: "8–12 грн/шт"           },
  "Яєчні білки":         { category: "dairy",   kcal: 52,  protein: 11,  fat: 0.2,  carbs: 0.7,  fiber: 0,   price: "4–7 грн/шт"            },
  "Твердий сир":         { category: "dairy",   kcal: 370, protein: 25,  fat: 29,   carbs: 0,    fiber: 0,   price: "350–500 грн/кг"        },
  "Грецький йогурт":     { category: "dairy",   kcal: 100, protein: 10,  fat: 5,    carbs: 4,    fiber: 0,   price: "70–120 грн/200г"       },
  "Плавлений сир":       { category: "dairy",   kcal: 265, protein: 12,  fat: 22,   carbs: 4,    fiber: 0,   price: "80–130 грн/100г"       },
  "Чеддер":              { category: "dairy",   kcal: 400, protein: 25,  fat: 33,   carbs: 1.3,  fiber: 0,   price: "450–700 грн/кг"        },
  "Моцарела":            { category: "dairy",   kcal: 280, protein: 17,  fat: 22,   carbs: 2.5,  fiber: 0,   price: "350–550 грн/250г"      },
  "Молоко":              { category: "dairy",   kcal: 64,  protein: 3.2, fat: 3.6,  carbs: 4.7,  fiber: 0,   price: "55–85 грн/л"           },
  "Кефір":               { category: "dairy",   kcal: 56,  protein: 2.8, fat: 2,    carbs: 4.7,  fiber: 0,   price: "50–80 грн/л"           },

  // ── Овочі ────────────────────────────────────────────────
  "Помідор":             { category: "veggies", kcal: 18,  protein: 0.9, fat: 0.2,  carbs: 3.9,  fiber: 1.2, price: "120–200 грн/кг"        },
  "Мікс овочей":         { category: "veggies", kcal: 40,  protein: 1.5, fat: 0.2,  carbs: 7,    fiber: 2.5, price: "140–220 грн/кг"        },
  "Огірок":              { category: "veggies", kcal: 15,  protein: 0.7, fat: 0.1,  carbs: 3,    fiber: 0.5, price: "80–160 грн/кг"         },
  "Маринований огірок":  { category: "veggies", kcal: 11,  protein: 0.7, fat: 0.1,  carbs: 2.2,  fiber: 1.0, price: "100–180 грн/700г"      },
  "Зелена цибуля":       { category: "veggies", kcal: 32,  protein: 1.8, fat: 0.2,  carbs: 7,    fiber: 2.6, price: "55–95 грн/пучок"       },
  "Айсберг":             { category: "veggies", kcal: 14,  protein: 0.9, fat: 0.1,  carbs: 3,    fiber: 1.2, price: "85–140 грн/голова"     },
  "Цибуля червона":      { category: "veggies", kcal: 40,  protein: 1.1, fat: 0.1,  carbs: 9,    fiber: 1.7, price: "65–100 грн/кг"         },
  "Цибуля":              { category: "veggies", kcal: 40,  protein: 1.1, fat: 0.1,  carbs: 9,    fiber: 1.7, price: "35–65 грн/кг"          },
  "Морква":              { category: "veggies", kcal: 41,  protein: 0.9, fat: 0.2,  carbs: 10,   fiber: 2.8, price: "40–75 грн/кг"          },
  "Картопля":            { category: "veggies", kcal: 77,  protein: 2,   fat: 0.1,  carbs: 17,   fiber: 2.2, price: "35–65 грн/кг"          },
  "Кабачок":             { category: "veggies", kcal: 17,  protein: 1.2, fat: 0.3,  carbs: 3.1,  fiber: 1.0, price: "65–120 грн/кг"         },
  "Перець":              { category: "veggies", kcal: 27,  protein: 1,   fat: 0.3,  carbs: 6,    fiber: 2.1, price: "140–280 грн/кг"        },
  "Капуста":             { category: "veggies", kcal: 25,  protein: 1.3, fat: 0.1,  carbs: 5.8,  fiber: 2.5, price: "25–50 грн/кг"          },
  "Пекінська капуста":   { category: "veggies", kcal: 16,  protein: 1.2, fat: 0.2,  carbs: 2.9,  fiber: 1.2, price: "55–100 грн/кг"         },
  "Томатна пасата":      { category: "veggies", kcal: 29,  protein: 1.5, fat: 0.4,  carbs: 5.4,  fiber: 1.5, price: "85–140 грн/500г"       },
  "Броколі зам.":        { category: "veggies", kcal: 34,  protein: 2.8, fat: 0.4,  carbs: 7,    fiber: 3.3, price: "100–180 грн/400г"      },
  "Цвітна капуста зам.": { category: "veggies", kcal: 25,  protein: 1.9, fat: 0.3,  carbs: 5,    fiber: 2.5, price: "100–170 грн/400г"      },
  "Печериці":            { category: "veggies", kcal: 22,  protein: 3.1, fat: 0.3,  carbs: 3.3,  fiber: 1.0, price: "140–220 грн/кг"        },

  // ── Крупи / Борошно / Бобові ─────────────────────────────
  "Гречка":              { category: "grains",  kcal: 343, protein: 13,  fat: 3.4,  carbs: 72,   fiber: 10.0, price: "65–110 грн/кг"         },
  "Рис":                 { category: "grains",  kcal: 365, protein: 7,   fat: 0.7,  carbs: 79,   fiber: 1.3, price: "55–100 грн/кг"         },
  "Рис суші":            { category: "grains",  kcal: 365, protein: 7,   fat: 0.7,  carbs: 79,   fiber: 1.3, price: "85–140 грн/кг"         },
  "Булгур":              { category: "grains",  kcal: 342, protein: 12,  fat: 1.3,  carbs: 76,   fiber: 12.0, price: "75–130 грн/кг"         },
  "Макарони ТЗ":         { category: "grains",  kcal: 352, protein: 13,  fat: 2.5,  carbs: 72,   fiber: 3.0, price: "65–120 грн/400г"       },
  "ЦЗ Борошно":          { category: "grains",  kcal: 340, protein: 12,  fat: 2,    carbs: 71,   fiber: 10.7, price: "60–100 грн/кг"         },
  "Звичайне борошно":    { category: "grains",  kcal: 364, protein: 10,  fat: 1,    carbs: 76,   fiber: 2.7, price: "40–70 грн/кг"          },
  "Борошно 00":          { category: "grains",  kcal: 364, protein: 12,  fat: 1,    carbs: 76,   fiber: 2.4, price: "80–140 грн/кг"         },
  "Червона сочевиця":    { category: "grains",  kcal: 352, protein: 25,  fat: 1.1,  carbs: 60,   fiber: 10.8, price: "100–160 грн/кг"        },
  "Квасоля":             { category: "grains",  kcal: 337, protein: 21,  fat: 1.5,  carbs: 61,   fiber: 15.0, price: "90–150 грн/кг"         },

  // ── Спеції / Інше ────────────────────────────────────────
  "Мед":                 { category: "spices",  kcal: 304, protein: 0.3, fat: 0,    carbs: 82,   fiber: 0.2, price: "200–350 грн/500г"      },
  "Кориця":              { category: "spices",  kcal: 247, protein: 4,   fat: 1.2,  carbs: 81,   fiber: 53.1, price: "65–110 грн/50г"        },
  "Ванілін":             { category: "spices",  kcal: 288, protein: 0.1, fat: 0.1,  carbs: 72,   fiber: 0,   price: "25–50 грн/пакет"       },
  "Насіння льону":       { category: "spices",  kcal: 534, protein: 18,  fat: 42,   carbs: 29,   fiber: 27.3, price: "90–140 грн/500г"       },
  "Соєвий соус":         { category: "spices",  kcal: 53,  protein: 8,   fat: 0,    carbs: 5,    fiber: 0.8, price: "90–150 грн/250мл"      },
  "Часник":              { category: "spices",  kcal: 149, protein: 6.4, fat: 0.5,  carbs: 33,   fiber: 2.1, price: "180–350 грн/кг"        },
  "Олія":                { category: "spices",  kcal: 884, protein: 0,   fat: 100,  carbs: 0,    fiber: 0,   price: "110–180 грн/л"         },
  "Олія оливкова":       { category: "spices",  kcal: 884, protein: 0,   fat: 100,  carbs: 0,    fiber: 0,   price: "320–550 грн/500мл"     },
  "Арахіс смажений":     { category: "spices",  kcal: 585, protein: 26,  fat: 49,   carbs: 16,   fiber: 8.5, price: "160–260 грн/500г"      },
  "Гірчиця":             { category: "spices",  kcal: 66,  protein: 3.7, fat: 3,    carbs: 6,    fiber: 3.3, price: "50–85 грн/200г"        },
  "Паприка":             { category: "spices",  kcal: 282, protein: 14,  fat: 13,   carbs: 54,   fiber: 34.9, price: "65–110 грн/100г"       },
  "Орегано":             { category: "spices",  kcal: 265, protein: 9,   fat: 4,    carbs: 69,   fiber: 42.5, price: "50–95 грн/20г"         },
  "Базилік":             { category: "spices",  kcal: 23,  protein: 3.2, fat: 0.6,  carbs: 2.7,  fiber: 1.6, price: "45–85 грн/пучок"       },
  "Куркума":             { category: "spices",  kcal: 354, protein: 8,   fat: 10,   carbs: 65,   fiber: 21.0, price: "85–140 грн/100г"       },
  "Лавровий лист":       { category: "spices",  kcal: 313, protein: 7.6, fat: 8.4,  carbs: 75,   fiber: 26.3, price: "35–65 грн/20г"         },
  "Петрушка":            { category: "spices",  kcal: 36,  protein: 3,   fat: 0.8,  carbs: 6,    fiber: 3.3, price: "35–65 грн/пучок"       },
  "Кріп":                { category: "spices",  kcal: 43,  protein: 3.5, fat: 1.1,  carbs: 7,    fiber: 2.1, price: "35–65 грн/пучок"       },
  "Томатна паста":       { category: "spices",  kcal: 82,  protein: 3.9, fat: 0.4,  carbs: 17,   fiber: 4.1, price: "55–95 грн/170г"        },
  "Норі":                { category: "spices",  kcal: 35,  protein: 6,   fat: 0.7,  carbs: 5,    fiber: 0.3, price: "140–280 грн/10 арк."   },
  "Кетчуп":              { category: "spices",  kcal: 100, protein: 1.5, fat: 0.1,  carbs: 25,   fiber: 0.3, price: "85–140 грн/350г"       },
  "Цукор":               { category: "spices",  kcal: 399, protein: 0,   fat: 0,    carbs: 100,  fiber: 0,   price: "65–100 грн/кг"         },
  "Дріжджі сухі":        { category: "spices",  kcal: 325, protein: 38,  fat: 7,    carbs: 38,   fiber: 27.0, price: "35–65 грн/100г"        },
  "Кунжут":              { category: "spices",  kcal: 573, protein: 18,  fat: 50,   carbs: 23,   fiber: 11.8, price: "140–220 грн/200г"      },
  "Майонез":             { category: "spices",  kcal: 680, protein: 1,   fat: 75,   carbs: 2,    fiber: 0,   price: "85–140 грн/300г"       },
  "Гірчиця діжонська":   { category: "spices",  kcal: 70,  protein: 3.6, fat: 3.6,  carbs: 5,    fiber: 3.0, price: "95–150 грн/200г"       },
  "Кукурудзяний крохмаль": { category: "grains", kcal: 381, protein: 0.3, fat: 0.1,  carbs: 91,   fiber: 1.0, price: "65–110 грн/400г"       },
  "Лимонний сік":        { category: "spices",  kcal: 22,  protein: 0.4, fat: 0.1,  carbs: 7,    fiber: 0.3, price: "65–100 грн/250мл"      },
  "Чорний перець":       { category: "spices",  kcal: 251, protein: 10,  fat: 3,    carbs: 64,   fiber: 25.3, price: "35–65 грн/50г"         },
  "Каррі":               { category: "spices",  kcal: 325, protein: 13,  fat: 14,   carbs: 58,   fiber: 33.2, price: "50–85 грн/50г"         },
  "Чилі":                { category: "spices",  kcal: 40,  protein: 1.9, fat: 0.4,  carbs: 9,    fiber: 1.5, price: "35–65 грн/пучок"       },
  "Тахіні":              { category: "spices",  kcal: 595, protein: 17,  fat: 54,   carbs: 21,   fiber: 9.3, price: "190–300 грн/300г"      },

  // ── Напої ────────────────────────────────────────────────
  "Теплий чай":          { category: "drinks",  kcal: 1,   protein: 0,   fat: 0,    carbs: 0.1,  fiber: 0,   price: "90–160 грн/100 пак."   },
};
