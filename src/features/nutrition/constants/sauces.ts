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
      { name: "Олія", grams: 10 },
    ],
  },
  "Паприково-олійний": {
    type: "marinade",
    ingredients: [
      { name: "Олія", grams: 20 },
      { name: "Паприка", grams: 5 },
      { name: "Часник", grams: 5 },
    ],
  },
  "Олійно-паприковий": {
    type: "marinade",
    ingredients: [
      { name: "Олія", grams: 20 },
      { name: "Паприка", grams: 5 },
    ],
  },
  "Олія + Кріп + Часник": {
    type: "marinade",
    ingredients: [
      { name: "Олія оливкова", grams: 20 },
      { name: "Кріп", grams: 10 },
      { name: "Часник", grams: 10 },
    ],
  },
  "Паприка + Лавровий лист": {
    type: "marinade",
    ingredients: [
      { name: "Олія", grams: 20 },
      { name: "Паприка", grams: 5 },
      { name: "Лавровий лист", grams: 2 },
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

  // СОУСИ (Salad Sauces)
  "Гірчиця": {
    type: "sauce",
    ingredients: [
      { name: "Гірчиця", grams: 10 },
    ],
  },
  "Орегано + Базилік": {
    type: "sauce",
    ingredients: [
      { name: "Орегано", grams: 2 },
      { name: "Базилік", grams: 2 },
      { name: "Олія", grams: 5 },
    ],
  },
  "Цацікі": {
    type: "sauce",
    ingredients: [
      { name: "Грецький йогурт", grams: 50 },
      { name: "Огірок", grams: 30 },
      { name: "Часник", grams: 5 },
      { name: "Кріп", grams: 5 },
    ],
  },
  "Сальса": {
    type: "sauce",
    ingredients: [
      { name: "Помідор", grams: 60 },
      { name: "Цибуля червона", grams: 10 },
      { name: "Часник", grams: 5 },
      { name: "Петрушка", grams: 5 },
      { name: "Лимонний сік", grams: 5 },
    ],
  },
  "Соєво-медовий": {
    type: "sauce",
    ingredients: [
      { name: "Соєвий соус", grams: 30 },
      { name: "Мед", grams: 10 },
      { name: "Часник", grams: 5 },
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
};
