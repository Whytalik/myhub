export type SauceType = "sauce" | "marinade";

export type SauceIngredient = {
  name: string;
  grams: number;
};

export type SauceDef = {
  type: SauceType;
  ingredients: SauceIngredient[];
};

export const SAUCES: Record<string, SauceDef> = {
  // МАРИНАДИ (Marinades)
  "Соєво-часниковий": {
    type: "marinade",
    ingredients: [
      { name: "Соєвий соус", grams: 30 },
      { name: "Часник", grams: 10 },
      { name: "Паприка", grams: 5 },
    ],
  },
  "Лимонно-трав'яний": {
    type: "marinade",
    ingredients: [
      { name: "Лимонний сік", grams: 20 },
      { name: "Орегано", grams: 5 },
      { name: "Чорний перець", grams: 2 },
      { name: "Олія", grams: 10 },
    ],
  },
  "Йогуртово-каррі": {
    type: "marinade",
    ingredients: [
      { name: "Грецький йогурт", grams: 50 },
      { name: "Каррі", grams: 5 },
      { name: "Куркума", grams: 2 },
    ],
  },
  "Гірчично-медовий": {
    type: "marinade",
    ingredients: [
      { name: "Гірчиця діжонська", grams: 15 },
      { name: "Мед", grams: 10 },
      { name: "Олія", grams: 10 },
    ],
  },
  "Пряний томатний": {
    type: "marinade",
    ingredients: [
      { name: "Томатна паста", grams: 30 },
      { name: "Часник", grams: 10 },
      { name: "Орегано", grams: 5 },
      { name: "Чилі", grams: 5 },
    ],
  },

  // СОУСИ (Salad Sauces)
  "Лимонно-оливковий": {
    type: "sauce",
    ingredients: [
      { name: "Олія оливкова", grams: 15 },
      { name: "Лимонний сік", grams: 10 },
      { name: "Чорний перець", grams: 2 },
    ],
  },
  "Йогурт з кропом": {
    type: "sauce",
    ingredients: [
      { name: "Грецький йогурт", grams: 40 },
      { name: "Кріп", grams: 10 },
      { name: "Часник", grams: 5 },
    ],
  },
  "Тахіні-лимонний": {
    type: "sauce",
    ingredients: [
      { name: "Тахіні", grams: 20 },
      { name: "Лимонний сік", grams: 10 },
    ],
  },

  // Legacy / Specific mappings for transition
  "Маринад для курки": {
    type: "marinade",
    ingredients: [{ name: "Соєвий соус", grams: 20 }, { name: "Часник", grams: 5 }, { name: "Олія", grams: 5 }],
  },
};
